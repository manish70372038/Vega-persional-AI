import User from "../model/user.js";
import Gemniapi from "../Gemniapi.js";

const gemnicontroller = async (req, res) => {
  try {
    const { command, aiName } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name;
    console.log("UserName:", userName);
    console.log("Command:", command);
    console.log("AiName:", aiName);

    const parsed = await Gemniapi(command, userName, aiName);
    console.log("Gemini Parsed:", parsed);

    let finalParsed = parsed;
    if (typeof parsed === "string") {
      try {
        const jsonMatch = parsed.match(/\{[\s\S]*\}/);
        finalParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) {
        return res.status(400).json({ message: "JSON parse error", raw: parsed });
      }
    }

    if (!finalParsed) {
      return res.status(400).json({ message: "AI ne valid response nahi diya" });
    }

    const action = finalParsed.action;
    const data = finalParsed.data || {};
    const reply = finalParsed.reply;
    const lang = finalParsed.lang || "en-US";

    // URL dono jagah se lo
    const finalUrl = data.url || finalParsed.url || "";
    const finalDeeplink = data.deeplink || finalParsed.deeplink || "";

    switch (action) {
      case "youtube_play":
      case "youtube_search":
      case "google_search":
      case "get_weather":
      case "get_news":
      case "navigate":
        return res.status(200).json({
          action,
          reply,
          lang,
          url: finalUrl,
          data
        });

      case "open_app":
        return res.status(200).json({
          action,
          reply,
          lang,
          deeplink: finalDeeplink,
          url: finalUrl,
          data
        });

      case "get_time":
        return res.status(200).json({
          action,
          reply,
          lang,
          time: data.time,
          data
        });

      case "get_date":
        return res.status(200).json({
          action,
          reply,
          lang,
          date: data.date,
          data
        });

      case "get_day":
        return res.status(200).json({
          action,
          reply,
          lang,
          day: data.day,
          data
        });

      case "get_datetime":
        return res.status(200).json({
          action,
          reply,
          lang,
          time: data.time,
          date: data.date,
          day: data.day,
          data
        });

      case "set_reminder":
        return res.status(200).json({
          action,
          reply,
          lang,
          reminder_task: data.reminder_task,
          reminder_time: data.reminder_time,
          data
        });

      case "calculate":
        return res.status(200).json({
          action,
          reply,
          lang,
          expression: data.expression,
          result: data.result,
          data
        });

      case "interview_start":
      case "interview_answer":
      case "interview_end":
        return res.status(200).json({
          action,
          reply,
          lang,
          interview_question: data.interview_question,
          interview_feedback: data.interview_feedback,
          data
        });

      case "tell_joke":
      case "general":
        return res.status(200).json({
          action,
          reply,
          lang,
          data
        });

      case "none":
        return res.status(200).json({
          action: "none",
          reply: "",
          lang,
          data: {}
        });

      default:
        return res.status(200).json({
          action: "general",
          reply,
          lang,
          data
        });
    }

  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export default gemnicontroller;