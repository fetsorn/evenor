use super::Settings;

#[derive(Debug, Default)]
pub struct CredentialsState {
    tried_ssh_key_from_agent: bool,
    tried_ssh_key_from_config: bool,
    ssh_username_requested: bool,
    tried_cred_helper: bool,
}

impl CredentialsState {
    pub fn get(
        &mut self,
        settings: &Settings,
        repo_config: &git2::Config,
        url: &str,
        username_from_url: Option<&str>,
        allowed_types: git2::CredentialType,
    ) -> Result<git2::Cred, git2::Error> {
        if allowed_types.contains(git2::CredentialType::USERNAME) {
            debug_assert!(username_from_url.is_none());
            self.ssh_username_requested = true;
        }

        if allowed_types.contains(git2::CredentialType::SSH_KEY) {
            debug_assert!(!self.ssh_username_requested);
            let username = username_from_url.unwrap();

            if !self.tried_ssh_key_from_config {
                self.tried_ssh_key_from_config = true;
                if let Some(ssh) = &settings.ssh {
                    return git2::Cred::ssh_key(
                        username,
                        ssh.public_key_path.as_deref(),
                        &ssh.private_key_path,
                        ssh.passphrase.as_deref(),
                    );
                }
            }

            if !self.tried_ssh_key_from_agent {
                self.tried_ssh_key_from_agent = true;
                return git2::Cred::ssh_key_from_agent(username);
            }
        }

        if allowed_types.contains(git2::CredentialType::USER_PASS_PLAINTEXT)
            && !self.tried_cred_helper
        {
            self.tried_cred_helper = true;
            return git2::Cred::credential_helper(repo_config, url, username_from_url);
        }

        if allowed_types.contains(git2::CredentialType::DEFAULT) {
            return git2::Cred::default();
        }

        Err(git2::Error::from_str("no credentials found"))
    }
}
