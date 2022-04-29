{
  description = "csvs-ui - web UI for a comma-separated value store";

  inputs = { nixpkgs.url = "github:fetsorn/nixpkgs/yarn2nix-doDist"; };

  outputs = inputs@{ self, nixpkgs }:
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
      defaultSystems = [
        "aarch64-linux"
        "aarch64-darwin"
        "i686-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
    in eachSystem defaultSystems (system:
      let
        pkgs = import nixpkgs { inherit system; };
        # interacts with git, served publicly
        csvs-ui-frontend-remote = pkgs.mkYarnPackage rec {
          name = "csvs-ui-frontend";
          src = ./frontend;
          configurePhase = ''
            cp -r $node_modules node_modules
            chmod -R 755 node_modules
          '';
          buildPhase = ''
            yarn run build
            cp -r build $out
          '';
          dontInstall = true;
          doDist = false;
        };
        # interacts with fs, served locally
        csvs-ui-frontend-local = pkgs.mkYarnPackage rec {
          name = "csvs-ui-frontend";
          src = ./frontend;
          configurePhase = ''
            cp -r $node_modules node_modules
            chmod -R 755 node_modules
          '';
          buildPhase = ''
            REACT_APP_BUILD_MODE=local yarn run build
            cp -r build $out
          '';
          dontInstall = true;
          doDist = false;
        };
        csvs-ui-backend-remote = pkgs.mkYarnPackage rec {
          name = "csvs-ui-backend";
          src = ./backend;
          buildPhase = ''
            mkdir -p deps/${name}/build
            cp -r ${csvs-ui-frontend-remote}/* deps/${name}/build/
            chmod -R 755 deps/${name}/build/*
          '';
        };
        csvs-ui-backend-local = pkgs.mkYarnPackage rec {
          name = "csvs-ui-backend";
          src = ./backend;
          buildPhase = ''
            mkdir -p deps/${name}/build
            cp -r ${csvs-ui-frontend-local}/* deps/${name}/build/
            chmod -R 755 deps/${name}/build/*
          '';
        };
      in {
        packages = {
          inherit csvs-ui-frontend-remote csvs-ui-backend-remote
            csvs-ui-backend-local csvs-ui-frontend-local;
        };
        defaultPackage = csvs-ui-backend-local;
        defaultApp = csvs-ui-backend-local;
        devShell = pkgs.mkShell {
          buildInputs = [
            csvs-ui-backend-local
            csvs-ui-backend-remote
            csvs-ui-frontend-local
            csvs-ui-frontend-remote
            pkgs.nodejs-16_x
            pkgs.yarn
          ];
        };
      });
}
