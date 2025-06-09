// // const express = require("express");
// // const { isAuthenticated } = require("../middleware/isAuthenticated");
// // const {
// //   createAbnormality,
// //   updateAbnormality,
// //   deleteAbnormality,
// //   getAbnormality,
// //   getAbnormalityAll,
// //   uploadAbnormalityImage,
// //   uploadAbnormalityImage2,
// //   getAbnormalityByIdAndDate,
// // } = require("../controller/abnormalityController");

// // const abnormalityRouter = express.Router();

// // // multer for file handling
// // const multer = require("multer");
// // const path = require("path");
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, path.resolve(path.join(__dirname, "../public/abnormalityImage")));
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + path.extname(file.originalname));
// //   },
// //   onError: function (err, next) {
// //     console.log("error", err);
// //     next();
// //   },
// // });
// // const upload = multer({ storage: storage });

// // abnormalityRouter.route("/create").post(createAbnormality);
// // abnormalityRouter
// //   .route("/update/:id")
// //   .put(updateAbnormality)
// //   .delete(deleteAbnormality);

// // abnormalityRouter.route("/find/:id").get(getAbnormality);
// // abnormalityRouter.route("/findByIdAndDate").get(getAbnormalityByIdAndDate);
// // abnormalityRouter.route("/find/fromDate/:fromDate/toDate/:toDate").get(getAbnormalityAll);
// // abnormalityRouter.route("/uploadImage").post(upload.single("image"), uploadAbnormalityImage);
// // abnormalityRouter.route("/uploadImage").post(upload.single("image"), uploadAbnormalityImage2);


// // module.exports = abnormalityRouter;
// const express = require("express");
// const { isAuthenticated } = require("../middleware/isAuthenticated");
// const {
//   createAbnormality,
//   updateAbnormality,
//   deleteAbnormality,
//   getAbnormality,
//   getAbnormalityAll,
//   uploadAbnormalityImage,
//   getAbnormalityByIdAndDate,
// } = require("../controller/abnormalityController");

// const abnormalityRouter = express.Router();

// // multer for file handling
// const multer = require("multer");
// const path = require("path");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.resolve(path.join(__dirname, "../public/abnormalityImage")));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });

// abnormalityRouter.route("/create").post(createAbnormality);
// abnormalityRouter
//   .route("/update/:id")
//   .put(updateAbnormality)
//   .delete(deleteAbnormality);

// abnormalityRouter.route("/find/:id").get(getAbnormality);
// abnormalityRouter.route("/findByIdAndDate").get(getAbnormalityByIdAndDate);
// abnormalityRouter.route("/find/fromDate/:fromDate/toDate/:toDate").get(getAbnormalityAll);

// // // Correct upload route
// // abnormalityRouter.route("/uploadImage").post(
// //   upload.fields([
// //     { name: "beforeImage", maxCount: 1 },
// //     { name: "afterImage", maxCount: 1 },
// //   ]),
// //   uploadAbnormalityImage
// // );
// const multiUpload = upload.fields([
//   { name: "beforeImage", maxCount: 1 },
//   { name: "afterImage", maxCount: 1 },
// ]);

// abnormalityRouter.post(
//   "/uploadImage",
//   (req, res, next) => {
//     multiUpload(req, res, function (err) {
//       if (err) {
//         console.error("Multer error:", err);
//         return res.status(400).json({
//           success: false,
//           message: "Multer error",
//           error: err.message,
//         });
//       }
//       next();
//     });
//   },
//   uploadAbnormalityImages
// );

// module.exports = abnormalityRouter;

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

// // Configure Multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.resolve(path.join(__dirname, "../public/abnormalityImage")));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// // Define fields for multi-upload
// const multiUpload = upload.fields([
//   { name: "beforeImage", maxCount: 1 },
//   { name: "afterImage", maxCount: 1 },
// ]);

// // Routes
// abnormalityRouter.post("/create", createAbnormality);
// abnormalityRouter
//   .route("/update/:id")
//   .put(updateAbnormality)
//   .delete(deleteAbnormality);

// abnormalityRouter.get("/find/:id", getAbnormality);
// abnormalityRouter.get("/findByIdAndDate", getAbnormalityByIdAndDate);
// abnormalityRouter.get("/find/fromDate/:fromDate/toDate/:toDate", getAbnormalityAll);

// // Safe image upload route (handles 0, 1, or 2 images)
// abnormalityRouter.post(
//   "/uploadImage",
//   (req, res, next) => {
//     multiUpload(req, res, function (err) {
//       if (err) {
//         console.error("Multer error:", err);
//         return res.status(400).json({
//           success: false,
//           message: "Multer error",
//           error: err.message,
//         });
//       }
//       next();
//     });
//   },
//   uploadAbnormalityImages
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
    console.log("test now",file)
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// const multiUpload = upload.fields([
//   { name: "beforeImage", maxCount: 1 },
//   { name: "afterImage", maxCount: 1 },
// ]);
const uploadBeforeImage = upload.single("beforeImage");


// Abnormality Routes
abnormalityRouter.post("/create", createAbnormality);
abnormalityRouter
  .route("/update/:id")
  .put(updateAbnormality)
  .delete(deleteAbnormality);

abnormalityRouter.get("/find/:id", getAbnormality);
abnormalityRouter.get("/findByIdAndDate", getAbnormalityByIdAndDate);
abnormalityRouter.get("/find/fromDate/:fromDate/toDate/:toDate", getAbnormalityAll);

// ✅ Safe image upload route
// abnormalityRouter.post(
//   "/uploadImage",
//   (req, res, next) => {
//     multiUpload(req, res, function (err) {
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
//       next();
//     });
//   },
//   uploadAbnormalityImages
// );
abnormalityRouter.post(
  "/uploadImage",
  (req, res, next) => {
    uploadBeforeImage(req, res, function (err) {
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

      // ✅ respond with filename
      res.status(200).json({
        success: true,
        file: req.file,
      });
    });
  }
);


module.exports = abnormalityRouter;
