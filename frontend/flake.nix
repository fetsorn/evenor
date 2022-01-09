{
  description = "timeline frontend";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      # Builds a map from <attr>=value to <attr>.<system>=value for each system.
      #
      #
      eachSystem = systems: f:
        let
          op = attrs: system:
            let
              ret = f system;
              op = attrs: key:
                attrs //
                {
                  ${key} = (attrs.${key} or { }) // { ${system} = ret.${key}; };
                }
              ;
            in
              builtins.foldl' op attrs (builtins.attrNames ret);
        in
          builtins.foldl' op { } systems
      ;
      defaultSystems = [
        "aarch64-linux"
        "aarch64-darwin"
        "i686-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
    in

      eachSystem defaultSystems (system:
        {
          devShell = import ./shell.nix { inherit nixpkgs; inherit system; };
        });
}
