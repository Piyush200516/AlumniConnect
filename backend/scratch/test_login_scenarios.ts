import 'dotenv/config';
import AuthService from '../src/services/auth.service';
import { Role } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

const authService = new AuthService();

async function runTests() {
  console.log("=== RUNNING AUTH SERVICE LOGIN TEST SCENARIOS ===\n");

  // Scenario 1: Sonu Yadav (Alumni in DB) logging in via Common Login (/api/auth/login)
  console.log("--- Scenario 1: sonuyadav21052003@gmail.com (Alumni) via Common Login (no forcedRole) ---");
  try {
    const res = await authService.login({ email: "sonuyadav21052003@gmail.com", password: "Password@123" });
    console.log("LOGIN RESULT: SUCCESS", res.user);
  } catch (err: any) {
    console.log("LOGIN RESULT: FAILED ->", err.message);
  }

  // Scenario 2: Sonu Yadav logging in via Student Login endpoint (/api/auth/student/login -> forcedRole = STUDENT)
  console.log("\n--- Scenario 2: sonuyadav21052003@gmail.com (Alumni) via Student Login endpoint (forcedRole = STUDENT) ---");
  try {
    const res = await authService.login({ email: "sonuyadav21052003@gmail.com", password: "Password@123" }, Role.STUDENT);
    console.log("LOGIN RESULT: SUCCESS", res.user);
  } catch (err: any) {
    console.log("LOGIN RESULT: FAILED ->", err.message);
  }

  // Scenario 3: Sonu Yadav logging in via Alumni Login endpoint (/api/auth/alumni/login -> forcedRole = ALUMNI)
  console.log("\n--- Scenario 3: sonuyadav21052003@gmail.com (Alumni) via Alumni Login endpoint (forcedRole = ALUMNI) ---");
  try {
    const res = await authService.login({ email: "sonuyadav21052003@gmail.com", password: "Password@123" }, Role.ALUMNI);
    console.log("LOGIN RESULT: SUCCESS", res.user);
  } catch (err: any) {
    console.log("LOGIN RESULT: FAILED ->", err.message);
  }

  // Scenario 4: Case Sensitivity Test - Uppercase email input "SonuYadav21052003@gmail.com"
  console.log("\n--- Scenario 4: Case sensitivity input 'SonuYadav21052003@gmail.com' ---");
  try {
    const res = await authService.login({ email: "SonuYadav21052003@gmail.com", password: "Password@123" });
    console.log("LOGIN RESULT: SUCCESS", res.user);
  } catch (err: any) {
    console.log("LOGIN RESULT: FAILED ->", err.message);
  }

  // Scenario 5: Seeded user with plain text password (CDC user: cdcaimsr@acropolis.in / Cdc@123)
  console.log("\n--- Scenario 5: Seeded CDC user with plain text password 'cdcaimsr@acropolis.in' ---");
  try {
    const res = await authService.login({ email: "cdcaimsr@acropolis.in", password: "Cdc@123" }, Role.CDC);
    console.log("LOGIN RESULT: SUCCESS", res.user);
  } catch (err: any) {
    console.log("LOGIN RESULT: FAILED ->", err.message);
  }

  // Scenario 6: Non-existent user
  console.log("\n--- Scenario 6: Non-existent email 'nonexistent@example.com' ---");
  try {
    const res = await authService.login({ email: "nonexistent@example.com", password: "somepassword" });
    console.log("LOGIN RESULT: SUCCESS", res.user);
  } catch (err: any) {
    console.log("LOGIN RESULT: FAILED ->", err.message);
  }

  await prisma.$disconnect();
}

runTests().catch(console.error);
