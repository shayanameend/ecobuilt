import type { NextFunction, Request, Response } from "express";

import cors from "cors";
import express from "express";
import morgan from "morgan";

import { expandResponse } from "@/middlewares/response";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expandResponse);

app.all("*", (_request, response) => {
  response.notFound({}, { message: "Not Found" });
});

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    console.error(error);

    response.internalServerError({}, { message: "Internal Server Error" });
  }
);

export { app };
