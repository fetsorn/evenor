{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-23.11";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = inputs@{ nixpkgs, rust-overlay, ... }:
    let
      eachSystem = systems: f:
        let
          op = attrs: system:
            let
              ret = f system;
              op = attrs: key:
                let
                  appendSystem = key: system: ret: { ${system} = ret.${key}; };
                in attrs // {
                  ${key} = (attrs.${key} or { })
                    // (appendSystem key system ret);
                };
            in builtins.foldl' op attrs (builtins.attrNames ret);
        in builtins.foldl' op { } systems;
      defaultSystems = [ "x86_64-linux" "aarch64-darwin" "aarch64-linux" ];
    in eachSystem defaultSystems (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rust-stable = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" "clippy" ];
        };
        crane = rec {
          lib = inputs.crane.lib.${system};
          stable = lib.overrideToolchain rust-stable;
        };
        src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
        package = (pkgs.lib.importJSON (src + "/package.json"));
        nodeVersion =
          builtins.elemAt (pkgs.lib.versions.splitVersion pkgs.nodejs.version)
          0;
        library = pkgs.mkYarnPackage rec {
          name = package.name;
          version = package.version;
          src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
          buildPhase = ''
            true
          '';
          # fixup of libexec hangs for undiscovered reason
          dontStrip = true;
        };
        webappDrv = buildMode:
          pkgs.mkYarnPackage rec {
            name = package.name;
            version = package.version;
            src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
            preConfigure = ''
              substituteInPlace package.json --replace "webpack --config webpack.web.config.mjs" "yarn exec webpack-cli -- --mode=development --config webpack.web.config.mjs --env buildMode=${buildMode}"
            '';
            buildPhase = ''
              yarn run build:webapp
            '';
            installPhase = "cp -r ./deps/${name}/release/renderer $out";
            distPhase = "true";
          };
        webapp = webappDrv "webapp";
        server = pkgs.mkYarnPackage rec {
          name = package.name + "-server";
          version = package.version;
          src = ./src/server;
          packageJSON = pkgs.stdenv.mkDerivation {
            name = package.name + "-server-package-json";
            inherit src;
            buildPhase = ''
              sed -i 's/\.\.\/\.\./${package.version}/' package.json
            '';
            installPhase = "cp package.json $out";
          };
          yarnLock = pkgs.stdenv.mkDerivation {
            name = package.name + "-server-yarn-lock";
            inherit src;
            preConfigure = ''
              substituteInPlace yarn.lock --replace "../.." "${package.version}"
            '';
            installPhase = "cat ${./.}/yarn.lock yarn.lock > $out";
          };
          workspaceDependencies = [ library ];
          preConfigure = ''
            substituteInPlace package.json --replace "../.." "${package.version}"
            substituteInPlace yarn.lock --replace "../.." "${package.version}"
          '';
          buildPhase = ''
            mkdir -p deps/${name}/build
            cp -r ${webappDrv "server"}/* deps/${name}/build/
            chmod -R 755 deps/${name}/build/*
          '';
          # fixup of libexec hangs for undiscovered reason
          dontStrip = true;
        };
      in rec {
        packages = { inherit webapp server library; };
        defaultPackage = packages.webapp;
        defaultApp = server;
        devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            rust-bin.stable.latest.default
            rust-analyzer
            pkg-config
            glib
            gdk-pixbuf
            pango
            gtk4
            libadwaita
            openssl
            sqlite
            # cargo-tauri
            rustup
            yarn
            (if system == "aarch64-darwin" then
              with darwin.apple_sdk.frameworks; [
                SystemConfiguration
                Carbon
                WebKit
                cocoapods
              ]
            else
              [ ])
            # linux-specific but doesn't work with a system check
            # gtk3
            # webkitgtk_4_1
            # libsoup_3
          ];
          RUST_SRC_PATH = pkgs.rustPlatform.rustLibSrc;
        };
      });
}
