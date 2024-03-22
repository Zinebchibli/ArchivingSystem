const { Router } = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const router = Router();
const ftp = require("basic-ftp");
const multer = require("multer");
const upload = multer({ dest: "../uploads/" });

router.post("/register", async (req, res) => {
  let fullname = req.body.fullname;
  let email = req.body.email;
  let password = req.body.password;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const folder = fullname.replace(/\s+/g, "-").toLowerCase();

  const record = await User.findOne({ email: email });
  const nom = await User.findOne({ fullname: fullname });

  if (record || nom) {
    return res.status(400).send({
      message: "Email or name are already registered",
    });
  } else {
    const user = new User({
      fullname: fullname,
      email: email,
      password: hashedPassword,
      folder: "/" + folder,
    });

    const result = await user.save();

    const { _id } = await result.toJSON();

    const token = jwt.sign({ _id: _id }, "secret");

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 1000,
    });
    res.json({
      user: result,
    });
  }
});

router.post("/login", async (req, res) => {
  const record = await User.findOne({ email: req.body.email });
  if (!record) {
    return res.status(404).send({ message: "Email doesnt exist" });
  }
  if (!(await bcrypt.compare(req.body.password, record.password))) {
    return res.status(404).send({
      message: "Password is incorrect",
    });
  }
  const token = jwt.sign({ _id: record._id }, "secret");

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.send({
    message: "successful login!",
  });
});

router.get("/user", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");
    if (!claims) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }
    const user = await User.findOne({ _id: claims._id });

    const { password, ...data } = await user.toJSON();

    res.send(data);
  } catch (err) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.send({
    message: "success",
  });
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const filePath = req.file.path;

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    await client.ensureDir("/files/" + folder);

    await client.uploadFrom(
      filePath,
      "/files/" + folder + "/" + req.file.originalname
    );
    console.log("File uploaded successfully");
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred during file upload" });
  } finally {
    client.close();
  }
});

router.get("/files", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    const files = await client.list(`/files/${folder}`);

    const filteredFiles = files.filter((file) => file.name !== "trash");

    res.status(200).json(filteredFiles);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred while fetching files" });
  } finally {
    client.close();
  }
});

router.get("/trashfiles", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    const files = await client.list(`/files/${folder}/trash`);

    res.status(200).json(files);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred while fetching files" });
  } finally {
    client.close();
  }
});

router.get("/download/:fileName", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    res.setHeader(
      "Content-disposition",
      `attachment; filename=${req.params.fileName}`
    );

    await client.downloadTo(res, "/files/" + req.params.fileName);
    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred during file download" });
  } finally {
    client.close();
  }
});

router.post("/trash", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    await client.ensureDir(`/files/${folder}`);

    await client.ensureDir(`/files/${folder}/trash`);
    await client.rename(
      `/files/${folder}/${req.body.fileName}`,
      `/files/${folder}/trash/${req.body.fileName}`
    );

    res.status(200).json({ message: "File moved to trash successfully" });
    console.log("File moved to trash successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "Error occurred during file move to trash" });
  } finally {
    client.close();
  }
});

router.post("/delete", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    await client.cd("/files/" + folder + "/trash");
    await client.remove(req.body.fileName);
    console.log("File deleted successfully");
    res.status(200).json({ message: "File deleted succesfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred during file delete" });
  } finally {
    client.close();
  }
});

router.post("/restore", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    await client.cd(`/files/${folder}/trash`);
    await client.rename(req.body.fileName, `../${req.body.fileName}`);

    console.log("File restored successfully");
    res.status(200).json({ message: "File restored successfully" });
  } catch (error) {
    console.error("Error occurred during file restoration:", error);
    res.status(500).json({ message: "Error occurred during file restoration" });
  } finally {
    client.close();
  }
});

router.post("/restoreall", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    await client.cd(`/files/${folder}/trash`);

    const files = await client.list();

    for (const file of files) {
      await client.rename(file.name, `../${file.name}`);
    }

    res.status(200).json({ message: "All files restored successfully" });
    console.log("All files restored successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred during file restore" });
  } finally {
    client.close();
  }
});

router.post("/deleteall", async (req, res) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "192.168.10.1",
      user: "ftpuser",
      password: "a",
      secure: false,
    });

    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "Unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const folder = user.folder;

    await client.cd(`/files/${folder}/trash`);

    const files = await client.list();
    for (const file of files) {
      await client.remove(file.name);
    }

    res.status(200).json({ message: "All files deleted successfully" });
    console.log("All files deleted successfully");
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Error occurred during file delete" });
  } finally {
    client.close();
  }
});

module.exports = router;