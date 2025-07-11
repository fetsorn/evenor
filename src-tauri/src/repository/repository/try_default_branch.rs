use super::Repository;
use crate::repository::{credentials_state::CredentialsState, settings::Settings};

pub fn try_default_branch<'a>(
    repository: &'a Repository,
    settings: &Settings,
) -> (Option<String>, Option<git2::Remote<'a>>) {
    if let Some(name) = &settings.default_branch {
        return (Some(name.to_owned()), None);
    }

    repository
        .default_remote(settings)
        .and_then(|mut remote| {
            let mut callbacks = git2::RemoteCallbacks::new();
            let mut credentials_state = CredentialsState::default();
            callbacks.credentials(|url, username_from_url, allowed_types| {
                credentials_state.get(
                    settings,
                    &git2::Config::open_default()?,
                    url,
                    username_from_url,
                    allowed_types,
                )
            });

            let _ = remote.connect_auth(git2::Direction::Fetch, Some(callbacks), None)?;

            let default_branch = repository.default_branch_for_remote(&remote)?;
            Ok((Some(default_branch), Some(remote)))
        })
        .unwrap_or((None, None))
}
