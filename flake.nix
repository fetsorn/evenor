{
  description = "timeline";

  inputs = { nixpkgs.url = "github:fetsorn/nixpkgs/yarn2nix-doDist"; };

  outputs = inputs@{ self, nixpkgs }:
    let
      pkgs = import nixpkgs { system = "aarch64-darwin"; };
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
        '';
        dontInstall = true;
        doDist = false;
      };
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
      packages.aarch64-darwin = {
        inherit timeline-backend timeline-frontend timeline-backend-local
          timeline-frontend-local;
      };
      defaultPackage.aarch64-darwin = timeline-backend-local;
      defaultApp.aarch64-darwin = timeline-backend-local;
      devShell.aarch64-darwin =
        pkgs.mkShell { buildInputs = [ pkgs.nodejs-16_x pkgs.yarn ]; };
    };
}

