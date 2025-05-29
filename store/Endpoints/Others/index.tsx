import { defaults } from "../default";

export const allApi = {
  createContact: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/contact/",
    },
  },
  allContactOption: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/all-contacts-name/",
    },
  },
  allContact: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/all-contacts/",
    },
  },
  profileContact: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/contact/",
    },
  },
  creteNotes: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/create-note/",
    },
  },
  getNotes: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/notes/",
    },
  },
  deleteNotes: {
    v1: {
      ...defaults.methods.DELETE,
      ...defaults.versions.v1,
      uri: "/notes/",
    },
  },
  editNote: {
    v1: {
      ...defaults.methods.PUT,
      ...defaults.versions.v1,
      uri: "/notes/",
    },
  },
  showBirthdays: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/birthdays/",
    },
  },
  showReminders: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/reminders/",
    },
  },
  yearsAgo: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/event/",
    },
  },
  editProfile: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/profile/",
    },
  },
  changePass: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/change-password/",
    },
  },
  forgotPasswordEmail: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/send-otp/",
    },
  },
  forgotPasswordOtpEmail: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/verify-email-otp/",
    },
  },
  forgotPasswordChange: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/reset-password/",
    },
  },
  changeProfileName: {
    v1: {
      ...defaults.methods.PUT,
      ...defaults.versions.v1,
      uri: "/profile/",
    },
  },
  mainSearch: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/search/",
    },
  },
  contactUsApi: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/contact-us/",
    },
  },
  staticData: {
    v1: {
      ...defaults.methods.GET,
      ...defaults.versions.v1,
      uri: "/topics/",
    },
  },
  editContactApi: {
    v1: {
      ...defaults.methods.PUT,
      ...defaults.versions.v1,
      uri: "/contact/",
    },
  },
  deleteContactApi: {
    v1: {
      ...defaults.methods.DELETE,
      ...defaults.versions.v1,
      uri: "/contact/",
    },
  },
  completeTaskApi: {
    v1: {
      ...defaults.methods.POST,
      ...defaults.versions.v1,
      uri: "/complete-reminder/",
    },
  },
};
