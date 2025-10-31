export const translations = {
  en: {
    song: {
      errorSongRequestPlaylist: "Can't add songs from a playlist",
      errorSongNotFound: "Song not found, try using URL instead",
      errorSongTooLong: "Song is too long (> 10 minutes)",
      errorSongIndex: "Please enter a valid song index",
      errorSongIsLive: "Can't play live videos",
      errorSongAlreadyInQueue: "Song is already in queue ({})",
      errorSongRemovedNoPermission: "You don't have permission to remove songs",
      errorSongInvalidAction: "Invalid command, valid commands are: set, add",

      queueEmpty: "No songs in queue",
      queueLength: "{} song(s) in queue",
      queuePageTitle: "[Page {} of {}]",
      queuePageFooter: "(...and {} more songs)",
      queueAt: "At position {}",

      songDefaultSet: "Successfully set default songs ({} default songs)",
      songDefaultAdd: "Successfully add default songs ({} default songs)",
      songPlaying: 'Now playing "{}" by {} — {} requested',
      songRemoved: 'Removed song #{} "{}" ({})',
      songAdded: 'Added song "{}" by {} ({})',
      songSkipped: 'Skipped song #{} "{}" ({})',
      songCurrentlyPlaying: "Currently playing",
    },
    info: {
      errorCommandNotFound: "Command not found: {}",

      version: "Manaobot v{} using Twurple v{} running on Bun v{}",
      seconds: "{} seconds",
      minutes: "{} minutes",
      hours: "{} hours",
      uptime: "This stream has been online for {}",
      offline: "Stream is offline",
      help: "📚 View all commands at https://tinyurl.com/manaobot — Type !help followed by a command to see its details.",
    },
    configuration: {
      errorInvalidLanguage: "Invalid language. Available languages: {}",
      errorNicknameTooLong: "Nickname is too long",
      errorNicknameContainsSpecialChars:
        "Nickname can only contain letters and numbers",
      errorGameNotFound: "Game not found: {}",
      errorPermission: "You don't have permission to run this command",
      errorCurrentGameNotFound:
        "Current game not found, or the broadcaster didn't specify stream's category",
      errorCodeInvalidOrExpired:
        "The provided code is invalid or has expired. Please generate a new code to proceed.",

      currentLanguage: "Your current language is: {}",
      currentLanguageChanged: "Language changed to: {}",
      currentNickname: "Your current nickname is: {}",
      currentNicknameChanged: "Your nickname has been changed to: {}",
      currentNicknameRemoved: "Nickname removed",
      currentGame: "Your current game is: {}",
      currentGameChanged: "Game changed to: {}",
      currentCurrency: "The channel's current currency is: {}",
      currentCurrencyChanged: "Channel's currency changed to: {}",
      linkSuccess: "Account successfully linked",
    },
    moderation: {
      errorCannotAnnounce: "An error occurred while trying to announce",
      errorCannotShoutout: "Shoutout failed",
      errorUserNotFound: "User not found: {}",

      streamTitleChanged: "Stream title changed to: {}",
      shoutoutSuccess: "Everyone go follow @{}!",
    },
    misc: {
      eat: "🍲 You should eat {}",
      times: "time(s)",
    },
    economy: {
      errorUserNotFound: "User not found: {}",
      errorAccountNotFound: "Account not found for user: {}",
      errorAlreadyDaily: "You have already claimed your daily income today",
      errorAlreadyWeekly:
        "You have already claimed your weekly income this week, please wait for {} day(s)",
      errorInvalidAmount: "Invalid amount has been entered",
      errorInsufficientFunds:
        "You have insufficient funds to perform this action",
      errorInvalidTimes:
        "Invalid number of times, please enter a number between 1 and 100",

      autobetResult:
        "Autobet results: {} time(s) — Won {} Lost {} — Remaining {} {}",
      currentBalance: "Your current balance is: {} {}",
      getDaily: "You have received your daily income of {} {}",
      getWeekly: "You have received your weekly income of {} {}",
      gambleWin: "Won {} {} remaining {} {}",
      gambleLose: "Lost {} {} remaining {} {}",
      transactionSuccess: "Transferred {} {} to {}",
      leaderboardTitle: "🏆 Top 5 Richest Users 🏆 | ",
    },
    command: {
      errorModeratorOnly: "This command is for moderators only",
      errorBroadcasterOnly: "This command is for the broadcaster only",
      errorArgsRequired: "Please provide the required arguments: {}",
      errorCommandHandler:
        "An error occurred while executing the command. The bot may stopped working.",
      errorCommandNotFound: 'Command {} not found, do you mean "{}"?',

      executeReload: "Successfully started reloading commands",
    },
    discord: {
      link: {
        errorUserNotLinked: "Link Twitch account using `/link` command first.",
        errorTargetNotLinked:
          "The target user has not linked their Twitch account.",

        title: "Link your Twitch account",
        description:
          "Run !link follow by the code in Twitch chat to link your account.",
        fieldName: "Code",
      },
      ping: {
        latency: "Latency is: {} ms",
      },
      help: {
        helpPageTitle: "(Page {} of {}) Category: {}",
        helpFooter:
          "You can send `/help command` followed by a command name to get more information about it.",
        helpBackToAll:
          "You can send `/help all` to get a list of all commands.",
        helpDescriptionField: "Description",
        helpCategoryField: "Category",
        helpOptionsField: "Options",
        helpNoOptions: "None",
      },
    },
  },
  th: {
    song: {
      errorSongRequestPlaylist: "ไม่สามารถเพิ่มเพลงจาก Playlist ได้",
      errorSongNotFound: "ไม่เจอเพลง ลองใช้ URL แทน",
      errorSongTooLong: "เพลงยาวเกินไป (> 10 นาที)",
      errorSongIndex: "กรุณาใส่หมายเลขเพลงที่ถูกต้อง",
      errorSongIsLive: "ไม่สามารถเล่นวิดิโอถ่ายทอดสดได้",
      errorSongAlreadyInQueue: "เพลงนี้อยู่ในคิวแล้ว ({})",
      errorSongRemovedNoPermission: "คุณไม่มีสิทธิ์ลบเพลงนี้",
      errorSongInvalidAction: "คำสั่งไม่ถูกต้อง คำสั่งที่ถูกต้องคือ: set, add",

      queueEmpty: "ไม่มีเพลงในคิว",
      queueLength: "{} เพลงในคิว",
      queuePageTitle: "[หน้า {} จาก {}]",
      queuePageFooter: "(...และอีก {} เพลง)",
      queueAt: "อยู่ที่ตำแหน่ง {}",

      songDefaultSet: "ตั้งค่าเพลงเริ่มต้นสำเร็จ (มีเพลง {} เพลง)",
      songDefaultAdd: "เพิ่มเพลงเริ่มต้นสำเร็จ (มีเพลง {} เพลง)",
      songPlaying: 'กำลังเล่น "{}" โดย {} — {} ขอเพลงนี้',
      songRemoved: 'ลบเพลง #{} "{}" ({})',
      songAdded: 'เพิ่มเพลง "{}" โดย {} ({})',
      songSkipped: 'ข้ามเพลง #{} "{}" ({})',
      songCurrentlyPlaying: "กำลังเล่นอยู่",
    },
    info: {
      errorCommandNotFound: "ไม่พบคำสั่ง: {}",

      help: "📚 ดูคำสั่งทั้งหมดได้ที่ https://tinyurl.com/manaobot — พิมพ์ !help ตามด้วยคำสั่ง เพื่อดูรายละเอียดของคำสั่งนั้น ๆ ครับ",
      version: "Manaobot v{} ใช้ Twurple v{} รันบน Bun v{}",
      seconds: "{} วินาที",
      minutes: "{} นาที",
      hours: "{} ชั่วโมง",
      uptime: "สตรีมนี้ออนไลน์มาแล้ว {}",
      offline: "สตรีมออฟไลน์",
    },
    configuration: {
      errorInvalidLanguage: "ภาษาที่ไม่ถูกต้อง ภาษาในปัจจุบัน: {}",
      errorNicknameTooLong: "ชื่อเล่นยาวเกินไป",
      errorNicknameContainsSpecialChars:
        "ชื่อเล่นสามารถมีได้เฉพาะตัวอักษรและตัวเลขเท่านั้น",
      errorGameNotFound: "ไม่พบเกม: {}",
      errorPermission: "คุณไม่มีสิทธิ์สั่งคำสั่งนี้",
      errorCurrentGameNotFound:
        "ไม่พบเกมของสตรีม หรือผู้ดำเนินรายการไม่ได้ระบุหมวดหมู่ของสตรีม",
      errorCodeInvalidOrExpired:
        "รหัสที่ให้มาไม่ถูกต้องหรือหมดอายุแล้ว กรุณาสร้างรหัสใหม่เพื่อดำเนินการต่อ",

      currentLanguage: "ภาษาปัจจุบันของคุณคือ: {}",
      currentLanguageChanged: "เปลี่ยนภาษาเป็น: {}",
      currentNickname: "ชื่อเล่นปัจจุบันของคุณคือ: {}",
      currentNicknameChanged: "ชื่อเล่นของคุณถูกเปลี่ยนเป็น: {}",
      currentNicknameRemoved: "ชื่อเล่นถูกลบแล้ว",
      currentGame: "เกมปัจจุบันของคุณคือ: {}",
      currentGameChanged: "เกมถูกเปลี่ยนเป็น: {}",
      currentCurrency: "สกุลเงินปัจจุบันของช่องคือ: {}",
      currentCurrencyChanged: "สกุลเงินของช่องถูกเปลี่ยนเป็น: {}",
      linkSuccess: "บัญชีถูกเชื่อมต่อเรียบร้อยแล้ว",
    },
    moderation: {
      errorCannotAnnounce: "เกิดข้อผิดพลาดขณะพยายามประกาศ",
      errorCannotShoutout: "ไม่สามารถ Shoutout ได้",
      errorUserNotFound: "ไม่พบผู้ใช้: {}",

      streamTitleChanged: "เปลี่ยนชื่อสตรีมเป็น: {}",
      shoutoutSuccess: "ทุกคนไปกดฟอลให้ @{} กันนะ!",
    },
    misc: {
      eat: "🍲 กิน {} ละกัน",
      times: "ครั้ง",
    },
    economy: {
      errorUserNotFound: "ไม่พบผู้ใช้: {}",
      errorAccountNotFound: "ไม่พบบัญชีของผู้ใช้: {}",
      errorAlreadyDaily: "คุณได้เคลมรายได้ประจำวันแล้วในวันนี้",
      errorAlreadyWeekly: "คุณได้เคลมรายได้ประจำสัปดาห์แล้วในสัปดาห์นี้",
      errorWeeklyCooldown: "กรุณารออีก {} วัน ก่อนที่จะเคลมรายได้ประจำสัปดาห์ได้อีกครั้ง",
      errorInvalidAmount: "จำนวนเงินไม่ถูกต้อง",
      errorInsufficientFunds: "คุณมีเงินไม่เพียงพอในการทำรายการนี้",
      errorInvalidTimes: "จำนวนครั้งไม่ถูกต้อง กรุณาใส่ตัวเลขระหว่าง 1 ถึง 100",

      autobetResult: "ผลการเล่นอัตโนมัติ: {} ครั้ง — ได้ {} เสีย {} — เหลือ {} {}",
      currentBalance: "ยอดเงินปัจจุบันของคุณคือ: {} {}",
      getDaily: "คุณได้รับรายได้ประจำวันของคุณแล้ว {} {}",
      getWeekly: "คุณได้รับรายได้ประจำสัปดาห์ของคุณแล้ว {} {}",
      gambleWin: "ชนะ {} {} เหลือ {} {}",
      gambleLose: "แพ้ {} {} เหลือ {} {}",
      transactionSuccess: "โอน {} {} ให้กับ {}",
      leaderboardTitle: "🏆 5 อันดับผู้ใช้ที่รวยที่สุด 🏆 | ",
    },
    command: {
      errorModeratorOnly: "คำสั่งนี้สำหรับผู้ดูแลเท่านั้น",
      errorBroadcasterOnly: "คำสั่งนี้สำหรับผู้ถือสิทธิ์เท่านั้น",
      errorArgsRequired: "กรุณาใส่พารามิเตอร์ที่จำเป็น: {}",
      errorCommandHandler: "เกิดข้อผิดพลาดขณะเรียกใช้คำสั่ง บอทอาจหยุดทำงาน",
      errorCommandNotFound: 'ไม่พบคำสั่ง {} คุณหมายถึง "{}" หรือเปล่า?',

      executeReload: "เริ่มต้นกระบวนการรีโหลดคำสั่งแล้ว",
    },
    discord: {
      link: {
        errorUserNotLinked: "เชื่อมต่อบัญชีกับทวิชโดยใช้คำสั่ง `/link` ก่อน",
        errorTargetNotLinked: "ผู้ใข้อีกคนยังไม่ได้เชื่อมต่อบัญชีกับทวิช",

        title: "เชื่อมต่อบัญชีกับทวิช",
        description: "พิมพ์คำสั่ง !link แล้วตามด้วยรหัสในแชททวิชเพื่อเชื่อมต่อบัญชี",
        fieldName: "รหัส",
      },
      ping: {
        latency: "ความหน่วงอยู่ที่: {} มิลลิวินาที",
      },
      help: {
        helpPageTitle: "(หน้า {} จาก {}) หมวด: {}",
        helpFooter:
          "สามารถพิมพ์ `/help command` แล้วตามด้วยชื่อคำสั่งเพื่อดูรายละเอียดเพิ่มเติมได้",
        helpBackToAll: "สามารถพิมพ์ `/help all` เพื่อดูรายการคำสั่งทั้งหมดได้",
        helpDescriptionField: "คำอธิบาย",
        helpCategoryField: "หมวดหมู่",
        helpOptionsField: "ตัวเลือก",
        helpNoOptions: "ไม่มี",
      },
    },
  },
};
