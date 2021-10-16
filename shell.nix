{ nixpkgs ? <nixpkgs>, system ? builtins.currentSystem }:
let
  m1 = import nixpkgs { localSystem = system; };
  x86 = import nixpkgs { localSystem = "x86_64-darwin"; overlays = []; };
in
m1.mkShell {
  buildInputs = [
    m1.nodejs-16_x
  ];

  shellHook = ''
  '';
}
