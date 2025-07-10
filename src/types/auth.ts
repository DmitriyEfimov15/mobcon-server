interface RequestWithUser extends Request {
    user: {
      id: string;
    };
  }