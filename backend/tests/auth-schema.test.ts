import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginSchema, registerStudentSchema } from "../src/schemas/auth.schema.js";

describe("validação dos schemas de login e cadastro do aluno", () => {
  it("rejeita login com e-mail vazio, inválido ou senha em branco", () => {
    const emptyResult = loginSchema.safeParse({ email: "   ", password: "   " });
    assert.equal(emptyResult.success, false);
    if (!emptyResult.success) {
      const fields = emptyResult.error.flatten().fieldErrors;
      assert.ok(fields.email?.length);
      assert.ok(fields.password?.length);
    }

    const invalidEmailResult = loginSchema.safeParse({
      email: "aluno-sem-arroba",
      password: "enade2026",
    });
    assert.equal(invalidEmailResult.success, false);
  });

  it("aceita login válido e remove espaços extras do e-mail", () => {
    const result = loginSchema.safeParse({
      email: "  ana.moraes@enade.edu.br  ",
      password: "enade2026",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "ana.moraes@enade.edu.br");
    }
  });

  it("rejeita cadastro de aluno com campos obrigatórios vazios ou apenas espaços", () => {
    const result = registerStudentSchema.safeParse({
      name: "   ",
      email: "email-invalido",
      password: "        ",
      registration: "   ",
      course: "  ",
    });
    assert.equal(result.success, false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      assert.ok(fields.name?.length);
      assert.ok(fields.email?.length);
      assert.ok(fields.password?.length);
      assert.ok(fields.registration?.length);
      assert.ok(fields.course?.length);
    }
  });

  it("rejeita cadastro de aluno com senha menor que 8 caracteres", () => {
    const result = registerStudentSchema.safeParse({
      name: "Ana Moraes",
      email: "ana.moraes@enade.edu.br",
      password: "1234567",
      registration: "2021.1.04512",
      course: "Sistemas de Computação",
    });
    assert.equal(result.success, false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      assert.ok(fields.password?.length);
    }
  });

  it("aceita cadastro de aluno válido", () => {
    const result = registerStudentSchema.safeParse({
      name: "  Ana Moraes  ",
      email: "  ana.moraes@enade.edu.br ",
      password: "senhaSegura123",
      registration: " 2021.1.04512 ",
      course: " Sistemas de Computação ",
      semester: 5,
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.name, "Ana Moraes");
      assert.equal(result.data.email, "ana.moraes@enade.edu.br");
      assert.equal(result.data.registration, "2021.1.04512");
      assert.equal(result.data.course, "Sistemas de Computação");
      assert.equal(result.data.semester, 5);
    }
  });
});
