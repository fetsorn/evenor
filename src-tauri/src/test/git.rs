use crate::git::create_repo;

#[tokio::test]
async fn create_repo_test() -> Result<()> {
    create_repo({}, "", Some("")).await?;

    assert!(false);
}
