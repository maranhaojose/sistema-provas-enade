import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertExistingFixtureUser,
  assertSeedEnvironment,
  fixtures,
  FixtureDivergenceError,
  SeedGuardError,
} from "../prisma/seed-utils.js";

const allowedEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  ALLOW_DEV_SEED: "true",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/provas_dev",
};

describe("guardas dos seeds de desenvolvimento", () => {
  it("aceita ambiente local explicitamente autorizado", () => {
    assert.doesNotThrow(() => assertSeedEnvironment(allowedEnvironment));
  });

  it("rejeita NODE_ENV de produção", () => {
    assert.throws(
      () =>
        assertSeedEnvironment({
          ...allowedEnvironment,
          NODE_ENV: "production",
        }),
      SeedGuardError,
    );
  });

  it("exige flag explícita de autorização", () => {
    assert.throws(
      () => assertSeedEnvironment({ ...allowedEnvironment, ALLOW_DEV_SEED: undefined }),
      SeedGuardError,
    );
  });

  it("rejeita host de banco não local sem autorização explícita", () => {
    assert.throws(
      () =>
        assertSeedEnvironment({
          ...allowedEnvironment,
          DATABASE_URL: "postgresql://user:pass@db.example.com:5432/provas_dev",
        }),
      SeedGuardError,
    );
  });

  it("permite host não local apenas com flag documentada", () => {
    assert.doesNotThrow(() =>
      assertSeedEnvironment({
        ...allowedEnvironment,
        DATABASE_URL: "postgresql://user:pass@db.example.com:5432/provas_dev",
        ALLOW_DEV_SEED_NONLOCAL: "true",
      }),
    );
  });

  it("rejeita provider que não seja PostgreSQL", () => {
    assert.throws(
      () =>
        assertSeedEnvironment({
          ...allowedEnvironment,
          DATABASE_URL: "file:./dev.db",
        }),
      SeedGuardError,
    );
  });

  it("detecta divergência de identidade conhecida", () => {
    const fixture = fixtures[0];
    assert.ok(fixture);

    assert.doesNotThrow(() =>
      assertExistingFixtureUser(
        { name: fixture.name, role: fixture.role, isActive: true },
        fixture,
      ),
    );

    assert.throws(
      () =>
        assertExistingFixtureUser(
          { name: "Outro Nome", role: fixture.role, isActive: true },
          fixture,
        ),
      FixtureDivergenceError,
    );
    assert.throws(
      () =>
        assertExistingFixtureUser(
          { name: fixture.name, role: "ADMIN", isActive: true },
          fixture,
        ),
      FixtureDivergenceError,
    );
    assert.throws(
      () =>
        assertExistingFixtureUser(
          { name: fixture.name, role: fixture.role, isActive: false },
          fixture,
        ),
      FixtureDivergenceError,
    );
  });

  it("mantém a conta fixture de administração no nível COORDINATOR", () => {
    const admin = fixtures.find((fixture) => fixture.kind === "admin");
    assert.ok(admin);
    assert.equal(admin.profile.accessLevel, "COORDINATOR");
  });
});
