{
  description = "timeline";

  inputs = { nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable"; };

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
        installPhase = "exit";
        distPhase = "exit";
      };
      timeline-backend = pkgs.mkYarnPackage rec {
        name = "timeline-backend";
        src = ./backend;
        buildPhase = ''
          mkdir deps/${name}/build
          cp -r ${timeline-frontend}/* deps/${name}/build/
          chmod -R 755 deps/${name}/build/*
        '';
        distPhase = "exit";
      };
    in {
      packages.aarch64-darwin.defaultPackage.aarch64-darwin = timeline-backend;
    };
}
