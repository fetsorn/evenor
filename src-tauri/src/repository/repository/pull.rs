use super::Repository;
use crate::repository::{
    credentials_state::CredentialsState, repository_status::RepositoryStatus, settings::Settings,
};
use serde::Serialize;

#[derive(Serialize)]
#[serde(tag = "state", content = "branch", rename_all = "snake_case")]
pub enum PullOutcome {
    UpToDate(String),
    CreatedUnborn(String),
    FastForwarded(String),
}

pub fn pull<F>(
    repository: &Repository,
    settings: &Settings,
    status: &RepositoryStatus,
    remote: Option<git2::Remote>,
    switch: bool, // whether to switch to the default branch before pulling
    mut progress_callback: F,
) -> crate::Result<PullOutcome>
where
    F: FnMut(git2::Progress),
{
    let mut remote = match remote {
        Some(remote) => remote,
        None => repository.default_remote(settings)?,
    };

    let repo_config = &repository.repo.config()?;

    let mut connect_callbacks = git2::RemoteCallbacks::new();
    let mut credentials_state = CredentialsState::default();
    connect_callbacks.credentials(move |url, username_from_url, allowed_types| {
        credentials_state.get(settings, repo_config, url, username_from_url, allowed_types)
    });

    let mut fetch_callbacks = git2::RemoteCallbacks::new();
    let mut credentials_state = CredentialsState::default();
    fetch_callbacks.credentials(move |url, username_from_url, allowed_types| {
        credentials_state.get(settings, repo_config, url, username_from_url, allowed_types)
    });

    fetch_callbacks.transfer_progress(|progress| {
        progress_callback(progress);
        true
    });

    let prune = match settings.prune {
        None => git2::FetchPrune::Unspecified,
        Some(false) => git2::FetchPrune::Off,
        Some(true) => git2::FetchPrune::On,
    };

    let mut remote_connection =
        remote.connect_auth(git2::Direction::Fetch, Some(connect_callbacks), None)?;

    let default_branch = match &status.default_branch {
        Some(name) => name.clone(),
        None => repository.default_branch_for_remote(remote_connection.remote())?,
    };
    if !status.head.on_branch(&default_branch) {
        if switch {
            if status.head.is_detached() {
                return Err(crate::Error::from_message(
                    "will not switch branch while detached",
                ));
            } else {
                repository.switch_branch(&default_branch)?;
            }
        } else {
            return Err(crate::Error::from_message("not on default branch"));
        }
    }

    remote_connection.remote().fetch::<String>(
        &[],
        Some(
            git2::FetchOptions::new()
                .remote_callbacks(fetch_callbacks)
                .download_tags(git2::AutotagOption::All)
                .update_fetchhead(true)
                .prune(prune),
        ),
        Some("multi-git: fetching"),
    )?;

    let mut fetch_head = None;
    repository
        .repo
        .fetchhead_foreach(|ref_name, remote_url, oid, is_merge| {
            if is_merge {
                fetch_head = Some(repository.repo.annotated_commit_from_fetchhead(
                    ref_name,
                    str::from_utf8(remote_url).expect("remote url is invalid utf-8"),
                    oid,
                ));
                false
            } else {
                true
            }
        })?;
    let fetch_head = match fetch_head {
        Some(fetch_head) => fetch_head?,
        None => return Err(crate::Error::from_message("no branch found to merge")),
    };

    let (merge_analysis, _) = repository.repo.merge_analysis(&[&fetch_head])?;

    if merge_analysis.is_up_to_date() {
        Ok(PullOutcome::UpToDate(default_branch))
    } else if merge_analysis.is_unborn() {
        repository.create_unborn(status, fetch_head)?;
        Ok(PullOutcome::CreatedUnborn(default_branch))
    } else if merge_analysis.is_fast_forward() {
        repository.fast_forward(fetch_head)?;
        Ok(PullOutcome::FastForwarded(default_branch))
    } else {
        Err(crate::Error::from_message("cannot fast-forward"))
    }
}
