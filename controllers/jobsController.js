import jobsModel from "../models/jobsModel.js";
import mongoose from "mongoose";

// ======== CREATE JOB ==========
export const createJobController = async (req, res, next) => {
  const { company, position } = req.body;
  if (!company || !position) {
    return next("Please provide all fields");
  }

  req.body.createdBy = req.user.userId;
  try {
    const job = await jobsModel.create(req.body);
    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
};

// =============== GET JOBS ===========
export const getAllJobsController = async (req, res, next) => {
  try {
    const jobs = await jobsModel.find({ createdBy: req.user.userId });
    res.status(200).json({
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// =============== UPDATE JOBS ===========
export const updateJobController = async (req, res, next) => {
  const { id } = req.params;
  const { company, position } = req.body;

  // Validation
  if (!company || !position) {
    return next("Please provide all fields");
  }

  try {
    // Find job
    const job = await jobsModel.findOne({ _id: id });

    // Validation
    if (!job) {
      return next(`No job found with this ID: ${id}`);
    }

    // Authorization check
    if (req.user.userId !== job.createdBy.toString()) {
      return next("You are not authorized to update this job");
    }

    // Update job
    const updatedJob = await jobsModel.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ updatedJob });
  } catch (error) {
    next(error);
  }
};

// =============== DELETE JOBS ===========
export const deleteJobController = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find job
    const job = await jobsModel.findOne({ _id: id });

    // Validation
    if (!job) {
      return next(`No job found with this ID: ${id}`);
    }

    // Authorization check
    if (req.user.userId !== job.createdBy.toString()) {
      return next("You are not authorized to delete this job");
    }

    await job.deleteOne();
    res.status(200).json({ message: "Success. Job Deleted!" });
  } catch (error) {
    next(error);
  }
};

// =============== JOBS STATS & FILTERS ===========
export const jobStatsController = async (req, res, next) => {
  try {
    const stats = await jobsModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $group: {
          _id: "$status", // Group by job status
          count: { $sum: 1 }, // Count the number of jobs in each status
        },
      },
    ]);

    // Default stats object
    const defaultStats = {
      pending: 0,
      reject: 0,
      interview: 0,
    };

    // Populate default stats based on aggregation result
    stats.forEach((item) => {
      defaultStats[item._id] = item.count;
    });

    res.status(200).json({ totalJobs: stats.length, stats: defaultStats });
  } catch (error) {
    next(error); // Handle errors properly
  }
};
