using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace PipelineConsole.Models {
    [BsonIgnoreExtraElements]
    class Pipeline {
        [BsonId]
        public ObjectId Id { get; }
        [BsonElement("name")]
        public String Name { get; set; }
        [BsonElement("tasks")]
        public List<ObjectId> TaskIds { get; set; }
        [BsonIgnore]
        public List<PipelineTask> Tasks { get; set; } = new List<PipelineTask>();
    }
}
