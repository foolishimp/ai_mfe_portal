/**
 * Enhanced Job types to support the configuration-driven approach
 */
export var JobStatus;
(function (JobStatus) {
    JobStatus["CREATED"] = "created";
    JobStatus["SUBMITTED"] = "submitted";
    JobStatus["RUNNING"] = "running";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["CANCELLED"] = "cancelled";
})(JobStatus || (JobStatus = {}));
