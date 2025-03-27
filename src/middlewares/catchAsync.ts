import type { NextFunction, Request, Response } from "express";

import { handleErrors } from "@/lib/error";

export const catchAsync =
  (
    cb: (
      request: Request,
      response: Response,
      next: NextFunction
    ) => Promise<void>
  ) =>
  (request: Request, response: Response, next: NextFunction) => {
    Promise.resolve(cb(request, response, next)).catch((error) =>
      handleErrors({ response, error })
    );
  };
