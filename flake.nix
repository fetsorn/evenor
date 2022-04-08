{
  description = "timeline";

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
        timeline-frontend = pkgs.mkYarnPackage rec {
          name = "timeline-frontend";
          src = ./frontend;
          configurePhase = ''
            cp -r $node_modules node_modules
            chmod -R 755 node_modules
          '';
          buildPhase = ''
            yarn run build
            cp -r build $out
            find "$node_modules" -name "*.wasm" | while read -r wasm; do cp --no-preserve=mode,ownership "$wasm" "$out/static/js"; done
          '';
          dontInstall = true;
          doDist = false;
        };
        # interacts with fs, served locally
        timeline-frontend-local = pkgs.mkYarnPackage rec {
          name = "timeline-frontend";
          src = ./frontend;
          configurePhase = ''
            cp -r $node_modules node_modules
            chmod -R 755 node_modules
          '';
          buildPhase = ''
            REACT_APP_BUILD_MODE=local yarn run build
            cp -r build $out
            find "$node_modules" -name "*.wasm" | while read -r wasm; do cp --no-preserve=mode,ownership "$wasm" "$out/static/js"; done
          '';
          dontInstall = true;
          doDist = false;
        };
        timeline-backend = pkgs.mkYarnPackage rec {
          name = "timeline-backend";
          src = ./backend;
          buildPhase = ''
            mkdir -p deps/${name}/build
            cp -r ${timeline-frontend}/* deps/${name}/build/
            chmod -R 755 deps/${name}/build/*
          '';
        };
        timeline-backend-local = pkgs.mkYarnPackage rec {
          name = "timeline-backend";
          src = ./backend;
          buildPhase = ''
            mkdir -p deps/${name}/build
            cp -r ${timeline-frontend-local}/* deps/${name}/build/
            chmod -R 755 deps/${name}/build/*
          '';
        };
      in {
        packages = {
          inherit timeline-frontend timeline-backend timeline-backend-local
            timeline-frontend-local;
        };
        defaultPackage = timeline-backend-local;
        defaultApp = timeline-backend-local;
        devShell =
          pkgs.mkShell { buildInputs = [ pkgs.nodejs-16_x pkgs.yarn ]; };
      });
}
