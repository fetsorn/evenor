{
  description = "timeline";

  inputs = {
    nixpkgs.url = "github:fetsorn/nixpkgs/yarn2nix-doDist";
  };

  outputs = inputs@{ self, nixpkgs }:
    let
      pkgs = import nixpkgs { system = "aarch64-darwin"; };
      mkYarnPackage1 = pkgs.mkYarnPackage;
      timeline-frontend = mkYarnPackage1 rec {
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
      timeline-backend = pkgs.mkYarnPackage rec {
        name = "timeline-backend";
        src = ./backend;
        buildPhase = ''
          mkdir -p deps/${name}/build
          cp -r ${timeline-frontend}/* deps/${name}/build/
          chmod -R 755 deps/${name}/build/*
        '';
      };
    in {
      packages.aarch64-darwin = { inherit timeline-backend timeline-frontend; };
      defaultPackage.aarch64-darwin = timeline-backend;
      defaultApp.aarch64-darwin = timeline-backend;
    };
}

