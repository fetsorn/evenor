use serde::{Serialize, Serializer};
use std::{fmt, io};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug)]
pub struct Error {
    inner: Box<dyn std::error::Error + Send + Sync>,
}

#[derive(Debug)]
struct Context {
    message: String,
    error: Error,
}

impl Error {
    pub fn from_message(message: impl ToString) -> Self {
        Error {
            inner: message.to_string().into(),
        }
    }

    pub fn with_context(error: impl Into<Self>, message: impl ToString) -> Self {
        Self::from(Context {
            message: message.to_string(),
            error: error.into(),
        })
    }

    pub fn context(self, message: impl ToString) -> Self {
        Error::with_context(self, message)
    }
}

impl From<io::Error> for Error {
    fn from(err: io::Error) -> Error {
        Error { inner: err.into() }
    }
}

impl From<fmt::Error> for Error {
    fn from(err: fmt::Error) -> Error {
        Error { inner: err.into() }
    }
}

impl From<Context> for Error {
    fn from(ctx: Context) -> Error {
        Error { inner: ctx.into() }
    }
}

impl From<serde_json::Error> for Error {
    fn from(ctx: serde_json::Error) -> Error {
        Error { inner: ctx.into() }
    }
}

impl From<tauri::Error> for Error {
    fn from(ctx: tauri::Error) -> Error {
        Error { inner: ctx.into() }
    }
}

impl From<zip::result::ZipError> for Error {
    fn from(ctx: zip::result::ZipError) -> Error {
        Error { inner: ctx.into() }
    }
}

impl From<git2kit::Error> for Error {
    fn from(ctx: git2kit::Error) -> Error {
        Error { inner: ctx.into() }
    }
}

impl From<csvs::error::Error> for Error {
    fn from(ctx: csvs::error::Error) -> Error {
        Error { inner: ctx.into() }
    }
}

impl From<git2::Error> for Error {
    fn from(ctx: git2::Error) -> Error {
        Error { inner: ctx.into() }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.inner.fmt(f)
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.inner.source()
    }
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // SEC-18: only expose top-level message to frontend, not full error chain
        #[derive(Serialize)]
        struct JsonError {
            message: String,
        }

        JsonError {
            message: self.to_string(),
        }
        .serialize(serializer)
    }
}

impl fmt::Display for Context {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.message.fmt(f)
    }
}

impl std::error::Error for Context {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        Some(&self.error)
    }
}

impl serde::de::Error for Error {
    fn custom<T>(msg: T) -> Self
    where
        T: fmt::Display,
    {
        Error::from_message(msg)
    }
}
