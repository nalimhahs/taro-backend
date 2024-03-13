{ pkgs, ... }:

{
  # https://devenv.sh/basics/
  dotenv.enable = true;

  # https://devenv.sh/packages/
  packages = [ 
    pkgs.git
    pkgs.bun
    pkgs.nodejs
    pkgs.rabbitmq-server
    pkgs.postgresql_15
  ];

  services.rabbitmq.enable = true;
  # services.postgres.enable = true;
  # services.postgres.initialDatabases = [{ name = "db"; }];

  # https://devenv.sh/scripts/
  scripts.dev.exec = "bun run index.ts";
  scripts.generate-migrations.exec = "npx drizzle-kit generate:pg";

  enterShell = ''
    git --version
  '';

  # https://devenv.sh/languages/
  # languages.nix.enable = true;

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";
  # processes.bun-run.exec = "bun --hot run index.ts";


  # See full reference at https://devenv.sh/reference/options/
}
