// const express = require("express");
// const path = require("path");
// const multer = require("multer");
// const {
//   createAbnormality,
//   updateAbnormality,
//   deleteAbnormality,
//   getAbnormality,
//   getAbnormalityAll,
//   getAbnormalityByIdAndDate,
//   uploadAbnormalityImages,
// } = require("../controller/abnormalityController");
// const abnormalityRouter = express.Router();
// // ✅ Ensure this folder exists: /public/abnormalityImage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../public/abnormalityImage"));
//   },
//   filename: (req, file, cb) => {
//     console.log("test now",file)
//     const ext = path.extname(file.originalname);
//     const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });
// // const multiUpload = upload.fields([
// //   { name: "beforeImage", maxCount: 1 },
// //   { name: "afterImage", maxCount: 1 },
// // ]);
// const uploadBeforeImage = upload.single("beforeImage");
// // Abnormality Routes
// abnormalityRouter.post("/create", createAbnormality);
// abnormalityRouter
//   .route("/update/:id")
//   .put(updateAbnormality)
//   .delete(deleteAbnormality);

// abnormalityRouter.get("/find/:id", getAbnormality);
// abnormalityRouter.get("/findByIdAndDate", getAbnormalityByIdAndDate);
// abnormalityRouter.get("/find/fromDate/:fromDate/toDate/:toDate", getAbnormalityAll);

// abnormalityRouter.post(
//   "/uploadImage",
//   (req, res, next) => {
//     uploadBeforeImage(req, res, function (err) {
//       if (err instanceof multer.MulterError) {
//         console.error("Multer error:", err);
//         return res.status(400).json({
//           success: false,
//           message: "Multer upload error",
//           error: err.message,
//         });
//       } else if (err) {
//         console.error("Unknown upload error:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Unknown server error during file upload",
//           error: err.message,
//         });
//       }

//       // ✅ respond with filename
//       res.status(200).json({
//         success: true,
//         file: req.file,
//       });
//     });
//   }
// );
// module.exports = abnormalityRouter;



const express = require("express");
const path = require("path");
const multer = require("multer");
const {
  createAbnormality,
  updateAbnormality,
  deleteAbnormality,
  getAbnormality,
  getAbnormalityAll,
  getAbnormalityByIdAndDate,
  uploadAbnormalityImages,
} = require("../controller/abnormalityController");
const abnormalityRouter = express.Router();

// ✅ Ensure this folder exists: /public/abnormalityImage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/abnormalityImage"));
  },
  filename: (req, file, cb) => {
    console.log("Uploading file:", file);
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Flexible upload middleware that handles both single and multiple images
const flexibleUpload = upload.fields([
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage", maxCount: 1 },
]);

// Abnormality Routes
abnormalityRouter.post("/create", createAbnormality);
abnormalityRouter
  .route("/update/:id")
  .put(updateAbnormality)
  .delete(deleteAbnormality);

abnormalityRouter.get("/find/:id", getAbnormality);
abnormalityRouter.get("/findByIdAndDate", getAbnormalityByIdAndDate);
abnormalityRouter.get("/find/fromDate/:fromDate/toDate/:toDate", getAbnormalityAll);

// ✅ Modified upload route to handle both single and multiple images
abnormalityRouter.post(
  "/uploadImage",
  (req, res, next) => {
    flexibleUpload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({
          success: false,
          message: "Multer upload error",
          error: err.message,
        });
      } else if (err) {
        console.error("Unknown upload error:", err);
        return res.status(500).json({
          success: false,
          message: "Unknown server error during file upload",
          error: err.message,
        });
      }

      // ✅ Handle both single and multiple image scenarios
      const uploadedFiles = {};
      let totalFiles = 0;

      // Check for beforeImage
      if (req.files && req.files.beforeImage && req.files.beforeImage.length > 0) {
        uploadedFiles.beforeImage = req.files.beforeImage[0];
        totalFiles++;
      }

      // Check for afterImage
      if (req.files && req.files.afterImage && req.files.afterImage.length > 0) {
        uploadedFiles.afterImage = req.files.afterImage[0];
        totalFiles++;
      }

      // ✅ Backward compatibility: if no files uploaded, return error
      if (totalFiles === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      // ✅ Response format that works for both scenarios
      if (totalFiles === 1 && uploadedFiles.beforeImage) {
        // Single image scenario (backward compatible)
        res.status(200).json({
          success: true,
          file: uploadedFiles.beforeImage, // This maintains backward compatibility
          files: uploadedFiles,
          message: `${totalFiles} file(s) uploaded successfully`,
        });
      } else {
        // Multiple images scenario
        res.status(200).json({
          success: true,
          files: uploadedFiles,
          totalFiles: totalFiles,
          message: `${totalFiles} file(s) uploaded successfully`,
        });
      }
    });
  }
);

module.exports = abnormalityRouter;