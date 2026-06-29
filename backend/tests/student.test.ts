import request from "supertest";
import { app } from "../src/server";

describe("Health Check", () => {
    test("GET / should return 200", async () => {
        const res = await request(app).get("/");

        expect(res.status).toBe(200);
    });
});