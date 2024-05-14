{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = inputs@{ nixpkgs, ... }:
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
        overlays = [ inputs.fenix.overlays.default ];
        pkgs = import nixpkgs { inherit system overlays; };
        crane = rec {
          lib = inputs.crane.lib.${system};
          stable = lib.overrideToolchain
            inputs.fenix.packages.${system}.minimal.toolchain;
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
            # preConfigure = ''
            #   substituteInPlace package.json --replace "webpack --config webpack.web.config.mjs" "yarn exec webpack-cli -- --mode=development --config webpack.web.config.mjs --env buildMode=${buildMode}"
            # '';
            buildPhase = ''
              yarn run build
            '';
            installPhase = "cp -r ./deps/${name}/dist $out";
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
        # TODO skip downloading all these when building for one target
        electronBuilds = {
          "30.0.1" = {
            "linux-x64" = pkgs.fetchurl {
              url =
                "https://github.com/electron/electron/releases/download/v30.0.1/electron-v30.0.1-linux-x64.zip";
              sha256 = "sha256-E3ll58ay0pzc4Mq6O89VxPKZqXy9CGOSoZIhL20BS54=";
            };
            "win32-x64" = pkgs.fetchurl {
              url =
                "https://github.com/electron/electron/releases/download/v30.0.1/electron-v30.0.1-win32-x64.zip";
              sha256 = "sha256-ymgBr8qoDhZCDVs6Y31fRorkOcaB8yIaG/bSD/zAARA=";
            };
            "win32-ia32" = pkgs.fetchurl {
              url =
                "https://github.com/electron/electron/releases/download/v30.0.1/electron-v30.0.1-win32-ia32.zip";
              sha256 = "sha256-RDBTAzHL/VJjLs4M0rVf4kpzy+nDeDPPqGkiNHJN3fE=";
            };
            "darwin-x64" = pkgs.fetchurl {
              url =
                "https://github.com/electron/electron/releases/download/v30.0.1/electron-v30.0.1-darwin-x64.zip";
              sha256 = "sha256-LIfcTfdwvIQEL7td6fBF2/3GrvjPvgR4Gvr69ckfxb8=";
            };
            "darwin-arm64" = pkgs.fetchurl {
              url =
                "https://github.com/electron/electron/releases/download/v30.0.1/electron-v30.0.1-darwin-arm64.zip";
              sha256 = "sha256-zAUIG75TLIU86t1bM6s2NlOx5N9NO5PCl6ak+otMGvE=";
            };
          };
        };
        electronZipDir = let electronBuild = electronBuilds."30.0.1";
        in pkgs.linkFarm "electron-zip-dir" [
          {
            name = "${electronBuild.linux-x64.name}";
            path = electronBuild.linux-x64;
          }
          {
            name = "${electronBuild.win32-x64.name}";
            path = electronBuild.win32-x64;
          }
          {
            name = "${electronBuild.win32-ia32.name}";
            path = electronBuild.win32-ia32;
          }
          {
            name = "${electronBuild.darwin-x64.name}";
            path = electronBuild.darwin-x64;
          }
          {
            name = "${electronBuild.darwin-arm64.name}";
            path = electronBuild.darwin-arm64;
          }
        ];
        buildZip = arch:
          pkgs.mkYarnPackage rec {
            name = package.name;
            version = package.version;
            src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
            electron_zip_dir = electronZipDir;
            ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
            extraBuildInputs = [ pkgs.zip ];
            DEBUG = "*";
            buildPhase = ''
              mkdir home
              touch home/.skip-forge-system-check
              rm ./deps/${name}/${name}
              HOME="$(realpath home)" yarn run electron-forge -- make --arch ${arch} --platform darwin --targets @electron-forge/maker-zip
            '';
            installPhase =
              "cp -r ./deps/${name}/out/make/zip/darwin/${arch} $out";
            distPhase = "true";
          };
        buildExeSquirrel = arch:
          pkgs.mkYarnPackage rec {
            name = package.name;
            version = package.version;
            src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
            electron_zip_dir = electronZipDir;
            ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
            extraBuildInputs =
              [ pkgs.wineWowPackages.full pkgs.mono pkgs.fontconfig pkgs.zip ];
            # DEBUG = "*";
            buildPhase = ''
              # electron-forge needs 'home' with a skip check file
              mkdir home
              touch home/.skip-forge-system-check
              ## squirrel is upset with symlink './deps/name/name -> .deps/name'
              #rm ./deps/${name}/${name}
              ## squirrel needs write access to node_modules
              #rm ./deps/${name}/node_modules
              #rm ./node_modules/${name}
              #cp -r ./node_modules ./deps/${name}/node_modules
              #chmod -R 755 ./deps/${name}/node_modules
              ## squirrel needs fontconfig
              ## squirrel tries to start a GUI app and fails
              # DISPLAY=:0 HOME="$(realpath home)" FONTCONFIG_FILE=${pkgs.fontconfig.out}/etc/fonts/fonts.conf FONTCONFIG_PATH=${pkgs.fontconfig.out}/etc/fonts/ yarn run electron-make
            '';
            installPhase =
              "cp -r ./deps/${name}/out/make/squirrel.windows/${arch} $out";
            distPhase = "true";
          };
        buildExe = arch:
          pkgs.mkYarnPackage rec {
            name = package.name;
            version = package.version;
            src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
            electron_zip_dir = electronZipDir;
            ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
            extraBuildInputs =
              [ pkgs.wineWowPackages.full pkgs.mono pkgs.fontconfig pkgs.zip ];
            # DEBUG = "*";
            buildPhase = ''
              # electron-forge needs 'home' with a skip check file
              mkdir home
              touch home/.skip-forge-system-check
              HOME="$(realpath home)" yarn run electron-make
            '';
            installPhase =
              "cp -r ./deps/${package.name}/out/make/zip/win32/${arch} $out";
            distPhase = "true";
          };
        buildRpm = arch:
          let
            builtRpm = pkgs.vmTools.runInLinuxVM (pkgs.mkYarnPackage rec {
              memSize = 4096; # 4 GiB for the VM
              name = package.name;
              version = package.version;
              src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
              electron_zip_dir = electronZipDir;
              ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
              extraBuildInputs = [ pkgs.rpm ];
              # DEBUG = "*";
              buildPhase = ''
                mkdir home
                touch home/.skip-forge-system-check
                rm ./deps/${name}/${name}
                HOME="$(realpath home)" yarn run electron-make
              '';
              installPhase = "cp -r ./deps/${name}/out/make/rpm/${arch} $out";
              distPhase = "true";
              dontFixup = true;
            });
          in pkgs.runCommand builtRpm.name { version = builtRpm.version; } ''
            cp -r ${builtRpm}/* $out
          '';
        buildDeb = arch:
          pkgs.mkYarnPackage rec {
            name = package.name;
            version = package.version;
            src = pkgs.nix-gitignore.gitignoreSource [ ".git" ] ./.;
            electron_zip_dir = electronZipDir;
            ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
            extraBuildInputs = [ pkgs.dpkg pkgs.fakeroot ];
            # DEBUG = "*";
            buildPhase = ''
              mkdir home
              touch home/.skip-forge-system-check
              rm ./deps/${name}/${name}
              HOME="$(realpath home)" yarn run electron-make
            '';
            installPhase = "cp -r ./deps/${name}/out/make/deb/${arch} $out";
            distPhase = "true";
          };
      in rec {
        packages = {
          inherit webapp server library;
          linux = {
            x64 = {
              deb = buildDeb "x64";
              rpm = buildRpm "x64";
            };
            ia32 = {
              deb = buildDeb "ia32";
              rpm = buildRpm "ia32";
            };
          };
          windows = {
            x64 = { exe = buildExe "x64"; };
            ia32 = { exe = buildExe "ia32"; };
          };
          macos = {
            x64 = { zip = buildZip "x64"; };
            arm64 = { zip = buildZip "arm64"; };
          };
          all = pkgs.linkFarm "electron-link-farm" [
            {
              name = "linux-x64-deb";
              path = packages.linux.x64.deb;
            }
            # {
            #   name = "linux-x64-rpm";
            #   path = packages.linux.x64.rpm;
            # }
            # {
            #   name = "linux-ia32-deb";
            #   path = packages.linux.ia32.deb;
            # }
            # {
            #   name = "linux-ia32-rpm";
            # path = packages.linux.ia32.rpm;
            # }
            {
              name = "windows-x64-exe";
              path = packages.windows.x64.exe;
            }
            {
              name = "windows-ia32-exe";
              path = packages.windows.ia32.exe;
            }
            {
              name = "macos-arm64-zip";
              path = packages.macos.arm64.zip;
            }
            {
              name = "macos-x64-zip";
              path = packages.macos.x64.zip;
            }
          ];
        };
        defaultPackage = packages.webapp;
        defaultApp = server;
        devShell = pkgs.mkShell {
          # prevent electron download from electron in package.json
          ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
          # use the electron builds from here
          electron_zip_dir = electronZipDir;
          nativeBuildInputs = with pkgs;
            [
              (fenix.complete.withComponents [
                "cargo"
                "clippy"
                "rust-src"
                "rustc"
                "rustfmt"
              ])
              rust-analyzer-nightly
              pkg-config
              yarn
              libiconv
            ] ++ (if system == "aarch64-darwin" then
              with darwin.apple_sdk.frameworks; [
                SystemConfiguration
                Carbon
                WebKit
                cocoapods
              ]
            else
              [ ]) ++ (if system == "x86_64-linux" || system == "aarch64-linux"
              || system == "x86_64-unknown-linux-gnu" then [
                # tauri
                gtk3
                webkitgtk_4_1
                libsoup_3
                glib
                gdk-pixbuf
                pango
                gtk4
                libadwaita
                openssl
                sqlite
                # debian builds
                dpkg
                fakeroot
                # rpm builds
                rpm
                # exe builds
                wineWowPackages.full
                mono
                # zip builds
                zip
                # github releases
                gitAndTools.gh
              ] else
                [ ]);
        };
      });
}
