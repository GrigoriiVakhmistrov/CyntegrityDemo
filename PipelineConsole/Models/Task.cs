using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace PipelineConsole.Models {
    [BsonIgnoreExtraElements]
    class PipelineTask {
        [BsonId]
        public ObjectId Id { get; }
        [BsonElement("name")]
        public String Name { get; set; }
        [BsonElement("averageTime")]
        public int AverageTime { get; set; }
    }


}
