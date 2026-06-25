import { globalErrorHandling } from "./middlewares/GlobalErrorHandling.js";
import authRouter from "./modules/auth/auth.routes.js";
import orderRouter from "./modules/order/order.routes.js";
import productRouter from "./modules/product/product.routes.js";
import userRouter from "./modules/user/user.routes.js";
import serviceRouter from "./modules/service/service.routes.js";
import contactRouter from "./modules/contactSubmission/contactSubmission.routes.js";
import analyticsRouter from "./modules/analyticsEvent/analyticsEvent.routes.js";
import smtpRouter from "./modules/smtpConfig/smtpConfig.routes.js";
import { AppError } from "./utils/AppError.js";

export function bootstrap(app) {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/services", serviceRouter);
  app.use("/api/v1/contact-submissions", contactRouter);
  app.use("/api/v1/analytics-events", analyticsRouter);
  app.use("/api/v1/smtp-configs", smtpRouter);

  app.all("*", (req, res, next) => {
    next(new AppError(`Endpoint ${req.originalUrl} was not found`, 404));
  });

  app.use(globalErrorHandling);
}
