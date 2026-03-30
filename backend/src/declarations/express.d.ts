declare global {
  namespace Express {
    interface User {
      _id?: any;
    }
  }
}
