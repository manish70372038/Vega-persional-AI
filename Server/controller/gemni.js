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

    const result = await Gemniapi(command, userName, aiName);
    console.log("Gemini Raw:", result);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: "AI ne valid JSON nahi diya" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(400).json({ message: "JSON parse error", raw: result });
    }

    const action = parsed.action;
    const data = parsed.data;
    const reply = parsed.reply;

    switch (action) {
      case "youtube_play":
      case "youtube_search":
      case "google_search":
      case "get_weather":
      case "get_news":
      case "navigate":
        return res.status(200).json({ action, reply, url: data.url, data });

      case "open_app":
        return res.status(200).json({ action, reply, deeplink: data.deeplink, url: data.url, data });

      case "get_time":
        return res.status(200).json({ action, reply, time: data.time, data });

      case "get_date":
        return res.status(200).json({ action, reply, date: data.date, data });

      case "get_day":
        return res.status(200).json({ action, reply, day: data.day, data });

      case "get_datetime":
        return res.status(200).json({ action, reply, time: data.time, date: data.date, day: data.day, data });

      case "set_reminder":
        return res.status(200).json({ action, reply, reminder_task: data.reminder_task, reminder_time: data.reminder_time, data });

      case "calculate":
        return res.status(200).json({ action, reply, expression: data.expression, result: data.result, data });

      case "tell_joke":
      case "general":
        return res.status(200).json({ action, reply, data });

      case "none":
        return res.status(200).json({ action: "none", reply: "", data: {} });

      default:
        return res.status(200).json({ action: "general", reply, data });
    }

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default gemnicontroller;