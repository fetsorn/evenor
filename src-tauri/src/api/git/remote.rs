pub struct Remote {
    pub url: Option<String>,
    pub token: Option<String>,
    pub name: Option<String>,
}

impl Remote {
    pub fn new(url: Option<&str>, token: Option<&str>, name: Option<&str>) -> Self {
        Remote {
            url: url.map(|s| s.to_string()),
            token: url.map(|s| s.to_string()),
            name: url.map(|s| s.to_string()),
        }
    }
}
