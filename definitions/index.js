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
  PutTaskRequest
}
