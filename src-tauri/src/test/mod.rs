pub mod csvs;
pub mod error;
pub mod git;
pub mod io;
pub mod lfs;
pub mod repository;
pub mod zip;

#[cfg(test)]
pub static temp_d: std::sync::LazyLock<temp_dir::TempDir> =
    std::sync::LazyLock::new(|| temp_dir::TempDir::new().unwrap());
