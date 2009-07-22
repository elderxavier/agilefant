
$(document).ready(function() {
  
  module("Dynamics: ModelFactory",{
    setup: function() {
      ModelFactory.instance = null;
      this.instance = ModelFactory.getInstance();
      this.instance.initialized = true;
      this.testObject = {
          id: 222,
          name: "Test Object"
      };
    },  
    teardown: function() { }
  });
  
  
  test("Get instance", function() {
    ModelFactory.instance = null;
    var instance = ModelFactory.getInstance();
    
    ok(ModelFactory.instance, "Instance has been created");
    
    var anotherInstance = ModelFactory.getInstance();
    equals(anotherInstance, instance, "Instance is singleton");
  });
  
  
  
  test("Initialization", function() {
    var expectedId = 222;
    var expectedType = "iteration";
    var internalInitializeCallCount = 0;
    
    var cb = function(data) {};
    
    this.instance._getData = function(type, id, callback) {
      same(type, expectedType, "Type was correct");
      same(id, expectedId, "Id was correct");
      same(callback, cb, "Callback is correct");
      internalInitializeCallCount++;
    };
    
    
    var actual = ModelFactory.initializeFor("iteration", 222, cb);
    
    same(internalInitializeCallCount, 1, "Internal initialize called");
   });
  
  
  
  
  test("Initialization invalid checks", function() {
    var exceptionCount = 0;
    
    var params =
      [
       [],
       [null],
       [ModelFactory.initializeForTypes.iteration, null],
       ["Incorrect type", 555]
       ];
    
    for (var i = 0; i < params.length; i++) {
      try {
        ModelFactory.initializeFor(params[i][0], params[i][1]);
      }
      catch (e) {
        if (e instanceof TypeError && e.message === "Type not recognized") {
          exceptionCount++;
        }
      }  
    }

    same(exceptionCount, 4, "Correct number of exceptions")
  });
  
 
  test("Static add object", function() {
    var task = new TaskModel();
    var story = new StoryModel();
    
    var addObjectCallCount = 0;
    var taskAdded = false;
    var storyAdded = false;
    this.instance._addObject = function(obj) {
      addObjectCallCount++;
      if (obj === task) {
        taskAdded = true;
      }
      else if (obj === story) {
        storyAdded = true;
      }
    };
    
    ModelFactory.addObject(task);
    ModelFactory.addObject(story);
    
    same(addObjectCallCount, 2, "Internal add object called twice");
    ok(taskAdded, "Task is added");
    ok(storyAdded, "Story is added");
  });
  
  
  test("Static add object - invalid checks", function() {
    var invalidObject = {};
    var UnknownClass = function() {
      this.initialize();
      this.persistedClassName = "faulty name";
    };
    UnknownClass.prototype = new CommonModel();
    
    var exceptionCount = 0;
    
    var params =
      [
       [],
       [null],
       [new UnknownClass()],
       [invalidObject]
       ];
    
    for (var i = 0; i < params.length; i++) {
      try {
        ModelFactory.addObject(params[i][0]);
      }
      catch (e) {
        if (e instanceof TypeError && e.message === "Invalid argument") {
          exceptionCount++;
        }
      }  
    }
    
    same(exceptionCount, 4, "Correct number of exceptions thrown");
  });
  
  
  test("Internal add object", function() {
    
    var task = new TaskModel();
    task.id = 3;
    var story = new StoryModel();
    story.id = 465;
    
    this.instance._addObject(task);
    this.instance._addObject(story);
    
    same(this.instance.data.task[3], task, "Task is added");
    same(this.instance.data.story[465], story, "Story is added");
  });
  
  
  test("Static get object", function() {   
    this.instance.data.task[222] = this.testObject;
    equals(ModelFactory.getObject("task", 222), this.testObject, "Correct object returned");
    
    var exceptionThrown = false;
    try {
      ModelFactory.getObject("task", "not found id");
    }
    catch(e) {
      ok(e instanceof Error, "Error is of correct type");
      same(e.message, "Not found", "Error message is correct");
      exceptionThrown = true; 
    }
    ok(exceptionThrown, "Exception thrown");
  });
  
  test("Static get object if exists", function () {
    this.instance.data.task[222] = this.testObject;
    equals(ModelFactory.getObjectIfExists("task", 222), this.testObject, "Correct object returned");
    equals(ModelFactory.getObjectIfExists("task", "not found id"), null, "Null object returned");
  });
  
  test("Static get object null checks", function() {    
    var internalCallCount = 0
    var exceptionCount = 0;
    
    this.instance._getObject = function() {
      internalCallCount++;
    };
    
    var params =
      [
       [undefined,null,TypeError,"Type not recognized"],
       [null,null,     TypeError,"Type not recognized"],
       ["This is invalid",null,TypeError,"Type not recognized"],
       [ModelFactory.types.iteration,123,Error,"Not found"]
       ];
    
    for (var i = 0; i < params.length; i++) {
      try {
        ModelFactory.getObject(params[i][0], params[i][1]);
      }
      catch (e) {
        if (e instanceof params[i][2] && e.message === params[i][3]) {
          exceptionCount++;
        }
      }  
    }
    
    same(exceptionCount, 4, "Correct number of exceptions thrown");
    same(internalCallCount, 1, "Internal getObject called only once");
  });
  
  
  test("Static create object", function() {
    var expectedType = "task";
    var newObject = {};
    
    var internalCreateObjectCallCount = 0;
    this.instance._createObject = function(type) {
      same(type, expectedType, "Type matches");     
      internalCreateObjectCallCount++;
      return newObject;
    };
    
    equals(ModelFactory.createObject(expectedType), newObject, "Correct object returned");
    same(internalCreateObjectCallCount, 1, "Internal createObject function called");
  });
  
  
  test("Static create object null checks", function() {    
    var exceptionCount = 0;
    var internalCreateCallCount = 0;
    
    this.instance._createObject = function() {
      internalCreateCallCount++;
    };
    
    // Undefined
    try {
      ModelFactory.createObject();
    }
    catch (e) {
      ok(e instanceof TypeError, "Error is of correct type");
      exceptionCount++;
    }
    
    // Null
    try {
      ModelFactory.createObject(null);
    }
    catch (e) {
      ok(e instanceof TypeError, "Error is of correct type");
      exceptionCount++;
    }
    
    // Invalid
    try {
      ModelFactory.createObject("This is invalid");
    }
    catch (e) {
      ok(e instanceof TypeError, "Error is of correct type");
      exceptionCount++;
    }
    
    same(exceptionCount, 3, "Correct number of exceptions thrown");
    same(internalCreateCallCount, 0, "Internal create object was not called");
  });
  
  
  test("Internal get object", function() {
    this.instance.data = {
      story: {
        123: {
          id: 123,
          name: "Test story with id 123"
        }
      },
      task: {
        123: {
          id: 123,
          name: "Test task with id 123"
        },
        7: {
          id: 7,
          name: "Test task with id 7"
        }
      }
    };
    
    var task123 = this.instance._getObject(ModelFactory.types.task, 123);
    var task7 = this.instance._getObject(ModelFactory.types.task, 7);
    var story123 = this.instance._getObject(ModelFactory.types.story, 123);
    
    var notFoundStory = this.instance._getObject(ModelFactory.types.story, 9876);

    ok(task123, "Task 123 is defined");
    ok(task7, "Task 7 is defined");
    ok(story123, "Story 123 is defined");
    
    equals(task123, this.instance.data.task[123], "Task with id 123 is returned");
    equals(task7, this.instance.data.task[7], "Task with id 7 is returned");    
    equals(story123, this.instance.data.story[123], "Story with id 123 is returned");
    
    equals(notFoundStory, null, "Null story is returned");
  });

  

  
  
  test("Internal create object", function() {
    var actualTask = this.instance._createObject(ModelFactory.types.task);
    var actualStory = this.instance._createObject(ModelFactory.types.story);
    
    var actualIteration = this.instance._createObject(ModelFactory.types.iteration);
    
    ok(actualTask instanceof TaskModel, "Task created correctly");
    ok(actualStory instanceof StoryModel, "Story created correctly");
    
    ok(actualIteration instanceof IterationModel, "Iteration created correctly");
 
    var items = [actualIteration, actualStory, actualTask];
    
    for (var i = 0; i < items.length; i++) {
      ok(jQuery.inArray(this.instance.listener, items[i].listeners) !== -1,
          "ModelFactory listener set");
    }
  });

  
  module("Dynamics: ModelFactory: constructs",{
    setup: function() {
      ModelFactory.instance = null;
      this.instance = ModelFactory.getInstance();
      this.originalCMSetData = CommonModel.prototype.setData;
    },
    teardown: function() {
      CommonModel.prototype.setData = this.originalCMSetData;
    }
  });
  
  
  
  test("Static update object - new object", function() {
    var newIteration = {
        id: 123,
        name: "Test iteration"
    };
    
    var setDataCalled = false;
    CommonModel.prototype.setData = function(data) {
      setDataCalled = true;
      same(data, newIteration, "The data is correct");
    };
    
    var actual = ModelFactory.updateObject(ModelFactory.types.iteration, newIteration);
    
    ok(actual instanceof IterationModel, "The returned object is an iteration");
    ok(setDataCalled, "Model's setData is called");
    equals(ModelFactory.getObject("iteration",123), actual, "The iteration object is stored");
    equals(actual.getId(), 123, "The id is correct");
  });
  
  
  
  test("Static update object - existing object", function() {
    var story = new StoryModel();
    story.setId(666);
    story.currentData.name = "Test story";
    this.instance.data.story[666] = story;
    
    var newData = {
      id: 666
    };
    
    var setDataCalled = false;
    CommonModel.prototype.setData = function(data) {
      setDataCalled = true;
      same(data, newData, "The data is correct");
    };
    
    var actual = ModelFactory.updateObject(ModelFactory.types.story, newData);
    
    same(actual, story, "The story object is correct");
    ok(setDataCalled, "Model's setData is called");
    equals(ModelFactory.getObject("story",666), actual, "The iteration object is stored");
    same(actual.getId(), 666, "The id is correct");
  });
  
  
  
  test("Static update object - faulty arguments", function() {
    var exceptionCount = 0;
    var params =
      [
       [],  // Undefined
       [null, null], // all nulls
       [null, {}], //type null
       [ModelFactory.types.iteration, {id:null}], // id null
       [ModelFactory.types.iteration, null], // data null
       [ModelFactory.types.iteration, "Invalid string"], // invalid data
       [ModelFactory.types.iteration, {id:"Jeejee"}], // invalid id
       [ModelFactory.types.iteration, {id:123}] // all ok
       ];
    
    for (var i = 0; i < params.length; i++) {
      try {
        var type = params[i][0];
        var data = params[i][1];
        ModelFactory.updateObject(type, data);
      }
      catch (e) {
        if (e instanceof Error &&
            e.message === "Illegal argument for ModelFactory.updateObject") {
          exceptionCount++;
        }
      }
    }
    
    same(exceptionCount, 7, "Exception count matches");
  });

  
//  test("Construct iteration", function() {
//    var mockControl = new MockControl();
//    var iter = mockControl.createMock(IterationModel);
//    var id = 123;
//    var data = {};
//    
//    
//    this.instance._createObject = function() {
//      return iter;
//    };
//    var addObjectCallCount = 0;
//    this.instance._addObject = function(obj) {
//      addObjectCallCount++;
//    };
//    
//    iter.expects().setId(id);
//    iter.expects().setData(data);
//    
//    this.instance._constructIteration(id, data);
//    
//    same(addObjectCallCount, 1, "Object added to ModelFactory singletons");
//    mockControl.verify();
//  });
  
});
