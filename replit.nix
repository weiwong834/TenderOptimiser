{ pkgs }: {
  deps = [
    pkgs.python312
    pkgs.python312Packages.flask
    pkgs.python312Packages.google-generativeai
    pkgs.gcc                # <-- this is the fix
  ];
}
