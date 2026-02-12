import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import http from "node:http";
import { gunzipSync } from "node:zlib";

const taskServiceMock = {
  getTasksByUser: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  toggleTaskCompletion: jest.fn(),
  deleteTask: jest.fn(),
} as {
  getTasksByUser: jest.MockedFunction<
    (
      userId: string,
      token: string,
      options?: { page: number; pageSize: number },
    ) => Promise<{ data: any[]; count: number; page: number; pageSize: number }>
  >;
  getTaskById: jest.MockedFunction<
    (taskId: number, userId: string, token: string) => Promise<any | null>
  >;
  createTask: jest.MockedFunction<
    (userId: string, payload: any, token: string) => Promise<any>
  >;
  updateTask: jest.MockedFunction<
    (
      taskId: number,
      userId: string,
      payload: any,
      token: string,
    ) => Promise<any | null>
  >;
  toggleTaskCompletion: jest.MockedFunction<
    (taskId: number, userId: string, token: string) => Promise<any | null>
  >;
  deleteTask: jest.MockedFunction<
    (taskId: number, userId: string, token: string) => Promise<boolean>
  >;
};

jest.unstable_mockModule("./middleware/auth.js", () => ({
  authenticateUser: (req: any, _res: any, next: () => void) => {
    req.user = { sub: "u1", accessToken: "token-1" };
    next();
  },
}));

jest.unstable_mockModule("./tasks/services/taskService.js", () => ({
  default: taskServiceMock,
}));

const { default: app } = await import("./app.js");

type RawResponse = {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
};

const requestRaw = (
  server: http.Server,
  path: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
): Promise<RawResponse> => {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Server address unavailable");
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method: options?.method ?? "GET",
        headers: options?.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );

    req.on("error", reject);
    if (options?.body) {
      req.write(options.body);
    }
    req.end();
  });
};

describe("app middleware integration", () => {
  let server: http.Server;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    Object.values(taskServiceMock).forEach((fn) => fn.mockReset());
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("sets cache header for health endpoint", async () => {
    const res = await requestRaw(server, "/health");

    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("public, max-age=60");
  });

  it("sets no-store cache header for API requests and response time header", async () => {
    taskServiceMock.getTasksByUser.mockResolvedValue({
      data: [],
      count: 0,
      page: 1,
      pageSize: 20,
    });

    const res = await requestRaw(server, "/api/tasks");

    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.headers["x-response-time"]).toMatch(/^\d+\.\dms$/);
  });

  it("compresses large API responses when client requests gzip", async () => {
    const data = Array.from({ length: 80 }, (_, index) => ({
      id: index + 1,
      title: `Task ${index + 1}`,
      description: "x".repeat(120),
      completed: false,
    }));

    taskServiceMock.getTasksByUser.mockResolvedValue({
      data,
      count: data.length,
      page: 1,
      pageSize: data.length,
    });

    const res = await requestRaw(server, "/api/tasks?page=1&pageSize=80", {
      headers: { "Accept-Encoding": "gzip" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-encoding"]).toBe("gzip");

    const decoded = JSON.parse(gunzipSync(res.body).toString("utf8"));
    expect(decoded.success).toBe(true);
    expect(decoded.data).toHaveLength(80);
  });
});
