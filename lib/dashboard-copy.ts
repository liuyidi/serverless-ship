export type DashboardLocale = "zh" | "en";

export type DashboardCopy = {
  shell: {
    eyebrow: string;
    readOnly: string;
    topbarTitles: {
      overview: string;
      deployments: string;
      deploymentDetail: string;
      supabase: string;
    };
    sidebar: {
      brandMeta: string;
      groups: {
        core: string;
        public: string;
      };
      nav: {
        deployments: string;
        supabase: string;
        publicSite: string;
      };
      languageLabel: string;
      languageOptions: {
        zh: string;
        en: string;
      };
    };
  };
  deployments: {
    hero: {
      kicker: string;
      title: string;
      description: string;
      pills: {
        readOnly: string;
        newestFirst: string;
        supabaseRest: string;
      };
      stats: {
        totalRows: string;
        sentDeliveries: string;
        pendingReleases: string;
        currentFilterResult: string;
        latestPageRecords: string;
        releaseStatusPending: string;
      };
    };
    panel: {
      kicker: string;
      title: string;
      description: string;
      supabaseStatus: string;
    };
    filters: {
      kicker: string;
      title: string;
      description: string;
      project: string;
      channel: string;
      status: string;
      keyword: string;
      from: string;
      to: string;
      submit: string;
      reset: string;
      projectPlaceholder: string;
      channelPlaceholder: string;
      statusPlaceholder: string;
      keywordPlaceholder: string;
    };
    table: {
      latestFirst: string;
      deployments: string;
      latestRow: string;
      noRows: string;
      unavailable: string;
      headings: {
        project: string;
        versionTag: string;
        channel: string;
        status: string;
        timestamps: string;
        delivery: string;
        links: string;
      };
    };
    row: {
      updated: string;
      noDeliveryError: string;
      release: string;
      workflow: string;
      detail: string;
      unknown: string;
    };
    pager: {
      previous: string;
      next: string;
      page: string;
    };
    status: {
      deploymentViewMissing: string;
      filterError: string;
    };
  };
};

export const dashboardCopy: Record<DashboardLocale, DashboardCopy> = {
  zh: {
    shell: {
      eyebrow: "仪表盘",
      readOnly: "只读",
      topbarTitles: {
        overview: "概览",
        deployments: "部署记录",
        deploymentDetail: "部署详情",
        supabase: "Supabase",
      },
      sidebar: {
        brandMeta: "控制台",
        groups: {
          core: "核心",
          public: "公开",
        },
        nav: {
          deployments: "部署记录",
          supabase: "Supabase",
          publicSite: "公开站点",
        },
        languageLabel: "语言",
        languageOptions: {
          zh: "中文",
          en: "English",
        },
      },
    },
    deployments: {
      hero: {
        kicker: "仪表盘 / 部署记录",
        title: "部署控制台",
        description: "只读查看发布历史、投递状态和外链信息。",
        pills: {
          readOnly: "只读",
          newestFirst: "最新优先",
          supabaseRest: "Supabase REST",
        },
        stats: {
          totalRows: "总记录数",
          sentDeliveries: "已发送投递",
          pendingReleases: "待处理发布",
          currentFilterResult: "当前筛选结果",
          latestPageRecords: "当前页记录",
          releaseStatusPending: "发布状态待处理",
        },
      },
      panel: {
        kicker: "筛选",
        title: "收窄列表",
        description: "可按项目、通道、状态、日期范围或关键字搜索。",
        supabaseStatus: "Supabase 状态",
      },
      filters: {
        kicker: "筛选条件",
        title: "收窄发布列表",
        description: "按项目、通道、状态、日期范围或关键字过滤。",
        project: "项目",
        channel: "通道",
        status: "状态",
        keyword: "关键字",
        from: "开始日期",
        to: "结束日期",
        submit: "筛选",
        reset: "重置",
        projectPlaceholder: "minibot desktop",
        channelPlaceholder: "GitHub Release",
        statusPlaceholder: "sent / failed / pending",
        keywordPlaceholder: "tag、仓库、版本",
      },
      table: {
        latestFirst: "最新优先",
        deployments: "条部署记录",
        latestRow: "最新一条：",
        noRows: "当前筛选条件下没有记录。",
        unavailable: "部署列表暂时不可用。",
        headings: {
          project: "项目",
          versionTag: "版本 / Tag",
          channel: "通道",
          status: "状态",
          timestamps: "时间",
          delivery: "投递",
          links: "链接",
        },
      },
      row: {
        updated: "更新时间",
        noDeliveryError: "没有投递错误",
        release: "发布",
        workflow: "工作流",
        detail: "详情",
        unknown: "未知",
      },
      pager: {
        previous: "上一页",
        next: "下一页",
        page: "页",
      },
      status: {
        deploymentViewMissing: "Supabase 中缺少 deployments 视图。",
        filterError: "筛选查询失败。",
      },
    },
  },
  en: {
    shell: {
      eyebrow: "Dashboard",
      readOnly: "Read only",
      topbarTitles: {
        overview: "Overview",
        deployments: "Deployments",
        deploymentDetail: "Deployment detail",
        supabase: "Supabase",
      },
      sidebar: {
        brandMeta: "Console",
        groups: {
          core: "Core",
          public: "Public",
        },
        nav: {
          deployments: "Deployments",
          supabase: "Supabase",
          publicSite: "Public site",
        },
        languageLabel: "Language",
        languageOptions: {
          zh: "中文",
          en: "English",
        },
      },
    },
    deployments: {
      hero: {
        kicker: "Dashboard / Deployments",
        title: "Deployments console",
        description: "Read-only operational view for release history, delivery status, and outbound links.",
        pills: {
          readOnly: "Read only",
          newestFirst: "Newest first",
          supabaseRest: "Supabase REST",
        },
        stats: {
          totalRows: "Total rows",
          sentDeliveries: "Sent deliveries",
          pendingReleases: "Pending releases",
          currentFilterResult: "Current filter result",
          latestPageRecords: "Latest page records",
          releaseStatusPending: "Release status pending",
        },
      },
      panel: {
        kicker: "Filters",
        title: "Refine the feed",
        description: "Search by project, channel, status, date range, or keyword.",
        supabaseStatus: "Supabase status",
      },
      filters: {
        kicker: "Filters",
        title: "Refine the feed",
        description: "Search by project, channel, status, date range, or keyword.",
        project: "Project",
        channel: "Channel",
        status: "Status",
        keyword: "Keyword",
        from: "From",
        to: "To",
        submit: "Filter",
        reset: "Reset",
        projectPlaceholder: "minibot desktop",
        channelPlaceholder: "GitHub Release",
        statusPlaceholder: "sent / failed / pending",
        keywordPlaceholder: "tag, repo, version",
      },
      table: {
        latestFirst: "Latest first",
        deployments: "deployments",
        latestRow: "Latest row: ",
        noRows: "No deployments match the current filters.",
        unavailable: "Deployments are temporarily unavailable.",
        headings: {
          project: "Project",
          versionTag: "Version / Tag",
          channel: "Channel",
          status: "Status",
          timestamps: "Timestamps",
          delivery: "Delivery",
          links: "Links",
        },
      },
      row: {
        updated: "Updated",
        noDeliveryError: "No delivery error",
        release: "Release",
        workflow: "Workflow",
        detail: "Detail",
        unknown: "unknown",
      },
      pager: {
        previous: "Previous",
        next: "Next",
        page: "Page",
      },
      status: {
        deploymentViewMissing: "The deployments view is missing from Supabase.",
        filterError: "Failed to load deployments.",
      },
    },
  },
};

export function resolveDashboardLocale(value: string | string[] | null | undefined): DashboardLocale {
  if (Array.isArray(value)) {
    return value[0] === "zh" ? "zh" : "en";
  }

  return value === "zh" ? "zh" : "en";
}

export function buildDashboardHref(
  pathname: string,
  search: string | URLSearchParams,
  locale: DashboardLocale,
) {
  const params = new URLSearchParams(search instanceof URLSearchParams ? search.toString() : search);
  params.set("lang", locale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
