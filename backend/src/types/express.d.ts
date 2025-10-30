declare namespace Express {
  // Augment Express Request with common custom fields
  export interface Request {
    user?: any;
    io?: any;
    [key: string]: any;
  }
}


