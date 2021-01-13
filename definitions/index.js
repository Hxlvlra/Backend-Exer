const UniqueIDData = {
  type: 'string',
  description: 'A unique identifier',
  value: 'c64e8ee5-9328-4084-981b-a3c6b2e45494',
  example: 'c64e8ee5-9328-4084-981b-a3c6b2e45494'
};

const TextData = {
  type: 'string',
  description: 'Any textual string',
  value: 'This is a text example!',
  example: 'This is a text example'
};

const IsDoneData = {
  type: 'boolean',
  description: 'If a task object is tagged as done',
  value: false,
  example: false
};

const DateData = {
  type: 'number',
  description: 'A date value that is in Unix Epoch',
  value: 1610426030298,
  example: 1610426030298
};

const SuccessData = {
  type: 'boolean',
  description: 'State of a response',
  value: true,
  example: true
};

const LimitData = {
  type: 'number',
  description: 'Limit of how many items we should query',
  value: 10,
  example: 10
};

const SuccessResponse = {
  type: 'object',
  description: 'Response with a success state only',
  properties: {
    success: SuccessData
  }
};

const TaskFullData = {
  type: 'object',
  description: 'Task object data coming from the database',
  properties: {
    id: UniqueIDData,
    text: TextData,
    isDone: IsDoneData,
    dateUpdated: DateData,
    dateCreated: DateData
  }
};

const TaskListData = {
  type: 'array',
  description: 'A list of tasks',
  items: TaskFullData
}

const GetManyTaskQuery = {
  type: 'object',
  description: 'Query parameters for getting many tasks',
  properties: {
    limit: LimitData,
    startDateCreated: DateData,
    endDateCreated: DateData,
    startDateUpdated: DateData,
    endDateUpdated: DateData
  }
};

const GetOneTaskParams = {
  type: 'object',
  description: 'Parameter for getting one tasks',
  properties: {
    id: UniqueIDData
  }
}

const UsernameData = {
  type: 'string',
  description: 'A unique username',
  value: 'hxlvlra',
  example: 'hxlvlra'
};

const PasswordData = {
  type: 'string',
  description: 'Password string',
  value: '93fded6e93fded6e',
  example: '93fded6e93fded6e'
}

const NameData = {
  type: 'string',
  description: 'Name string',
  value: 'David',
  example: 'David'
};

const IsAdminData = {
  type: 'boolean',
  description: 'If the user is an admin',
  value: false,
  example: false
}

const UserFullData = {
  type: 'object',
  description: 'User data for response without the password',
  properties: {
    username: UsernameData,
    firstName: NameData,
    lastName: NameData,
    dateUpdated: DateData,
    dateCreated: DateData,
    isAdmin: IsAdminData
  }
}

const GetOneUserResponse = {
  type: 'object',
  description: 'Returns a a user',
  required: ['success', 'data'],
  properties: {
    success: SuccessData,
    data: UserFullData
  }
}

const PostUserRequest = {
  type: 'object',
  description: 'User object data for creation',
  required: [
    'username',
    'password', 
    'firstName',
    'lastName'
  ],
  properties: {
    username: UsernameData,
    password: PasswordData,
    firstName: NameData,
    lastName: NameData,
    isAdmin: IsAdminData
  }
}

const LoginUserRequest = {
  type: 'object',
  description: 'User object data for login',
  required: [
    'username',
    'password', 
  ],
  properties: {
    username: UsernameData,
    password: PasswordData,
  }
}

const GetManyTaskResponse = {
  type: 'object',
  description: 'Returns a list of tasks',
  required: ['success', 'data'],
  properties: {
    success: SuccessData,
    data: TaskListData
  }
}

const PostTaskRequest = {
  type: 'object',
  description: 'Task object data for creation',
  required: [
    'text'
  ],
  properties: {
    text: TextData,
    isDone: IsDoneData
  }
}

const PutTaskRequest = {
  type: 'object',
  description: 'Task object data for update',
  properties: {
    text: TextData,
    isDone: IsDoneData
  }
}

const GetOneTaskResponse = {
  type: 'object',
  description: 'Returns a task',
  required: ['success', 'data'],
  properties: {
    success: SuccessData,
    data: TaskFullData
  }
}

exports.definitions = {
  SuccessResponse,
  GetManyTaskResponse,
  GetManyTaskQuery,
  GetOneTaskParams,
  GetOneTaskResponse,
  PostTaskRequest,
  PutTaskRequest,
  PostUserRequest,
  GetOneUserResponse,
  LoginUserRequest
}
