import nodePath from "node:path";
import nodeFs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = nodePath.resolve(__dirname, "..");
const PREVIEW_DIR = nodePath.join(PROJECT_ROOT, "preview");

const ROUTE_PREFIX = "/plugins/js-vi";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

const BRAND_FILES = {
  identity: nodePath.join(PROJECT_ROOT, "brand", "identity.md"),
  philosophy: nodePath.join(PROJECT_ROOT, "brand", "philosophy.md"),
  principles: nodePath.join(PROJECT_ROOT, "brand", "principles.md"),
  tone: nodePath.join(PROJECT_ROOT, "voice", "tone-and-style.md"),
};

function textResult(text) {
  return { content: [{ type: "text", text }] };
}

function jsonResult(data) {
  return textResult(JSON.stringify(data, null, 2));
}

function serveStaticFile(res, filePath) {
  const ext = nodePath.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  const stream = nodeFs.createReadStream(filePath);
  stream.on("error", () => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });
  res.writeHead(200, { "Content-Type": mime });
  stream.pipe(res);
}

function applyConfig(pluginCfg) {
  const cfg = {
    browserPath: pluginCfg.browserPath || "",
    defaultScheme: pluginCfg.defaultScheme || "dark",
    defaultSize: pluginCfg.defaultSize || "a4",
    outputDir: pluginCfg.outputDir
      ? nodePath.resolve(pluginCfg.outputDir)
      : nodePath.join(PROJECT_ROOT, "poster"),
    extraTemplatesDirs: pluginCfg.extraTemplatesDirs
      ? pluginCfg.extraTemplatesDirs.split(",").map((d) => d.trim()).filter(Boolean)
      : [],
  };
  return cfg;
}

export default function register(api) {
  const pluginCfg = api.pluginConfig ?? {};
  const cfg = applyConfig(pluginCfg);

  if (cfg.extraTemplatesDirs.length > 0) {
    import("../core/template-engine.js").then((mod) => {
      mod.setExtraTemplatesDirs(cfg.extraTemplatesDirs.map((d) => nodePath.resolve(d)));
    });
  }

  // ---------------------------------------------------------------------------
  // Tool: vi_templates_list
  // ---------------------------------------------------------------------------

  api.registerTool(
    {
      name: "vi_templates_list",
      label: "VI: List Templates",
      description:
        "列出所有可用的海报模板。返回每个模板的名称、标签、支持的尺寸、配色方案、字段定义和动画信息。",
      parameters: { type: "object", properties: {} },
      async execute() {
        try {
          const { listTemplates } = await import("../core/template-engine.js");
          const templates = listTemplates().map((t) => ({
            name: t.name,
            label: t.label,
            sizes: t.sizes,
            schemes: t.schemes,
            fields: t.fields,
            animation: t.animation || null,
          }));
          if (templates.length === 0) {
            return textResult("没有找到可用的模板。");
          }
          return jsonResult(templates);
        } catch (err) {
          return textResult(`查询模板失败: ${err.message}`);
        }
      },
    },
    { optional: true },
  );

  // ---------------------------------------------------------------------------
  // Tool: vi_poster_generate
  // ---------------------------------------------------------------------------

  api.registerTool(
    {
      name: "vi_poster_generate",
      label: "VI: Generate Poster",
      description:
        "根据模板生成品牌海报。支持多种输出格式（html/png/jpeg/svg/gif/pdf）、配色方案和尺寸。" +
        "生成 PNG/JPEG/PDF/GIF 需要配置 browserPath。",
      parameters: {
        type: "object",
        properties: {
          template: {
            type: "string",
            description: "模板名称（terminal/card/cybertaoist）",
          },
          format: {
            type: "string",
            description: "输出格式（html/png/jpeg/svg/gif/pdf），默认 html",
            enum: ["html", "png", "jpeg", "jpg", "svg", "gif", "pdf"],
          },
          scheme: {
            type: "string",
            description: "配色方案（daylight/dark/minimal），默认使用插件配置",
          },
          size: {
            type: "string",
            description: "海报尺寸（a4/square/banner/story），默认使用插件配置",
          },
          title: { type: "string", description: "海报标题（支持 \\n 换行）" },
          subtitle: { type: "string", description: "副标题" },
          date: { type: "string", description: "日期文本" },
          location: { type: "string", description: "地点文本" },
          info: { type: "string", description: "附加信息" },
          tag: { type: "string", description: "标签文本" },
          output: { type: "string", description: "输出文件路径（留空则自动生成）" },
        },
        required: ["template"],
      },
      async execute(_toolCallId, params) {
        try {
          const { renderToHTML, findTemplate } = await import("../core/template-engine.js");
          const { validateOptions, mergeContentWithDefaults, SIZES } = await import("../core/config.js");
          const { renderOutput } = await import("../core/renderer-factory.js");

          const format = params.format || "html";
          const scheme = params.scheme || cfg.defaultScheme;
          const size = params.size || cfg.defaultSize;

          validateOptions({ scheme, size, format });

          const meta = findTemplate(params.template);
          if (!meta) {
            const { listTemplates } = await import("../core/template-engine.js");
            const available = listTemplates().map((t) => t.name).join(", ");
            return textResult(`模板不存在: ${params.template}\n可用模板: ${available}`);
          }

          const content = mergeContentWithDefaults(
            {
              title: params.title,
              subtitle: params.subtitle,
              date: params.date,
              location: params.location,
              info: params.info,
              tag: params.tag,
            },
            meta,
          );

          const animated = format === "gif";
          const options = { scheme, size, animated };
          const html = await renderToHTML(params.template, content, options);

          const ext = format === "jpg" ? "jpeg" : format;
          const outputPath = params.output
            ? nodePath.resolve(params.output)
            : nodePath.resolve(cfg.outputDir, `poster-${params.template}.${ext}`);

          const dim = SIZES[size] || SIZES.a4;
          const animMeta = meta.animation || {};

          const result = await renderOutput(html, format, outputPath, {
            ...options,
            width: dim.w,
            height: dim.h,
            fps: animMeta.defaultFps,
            duration: animMeta.duration,
            browserPath: cfg.browserPath || undefined,
          });

          return textResult(`✓ 海报已生成: ${result}`);
        } catch (err) {
          return textResult(`生成海报失败: ${err.message}`);
        }
      },
    },
    { optional: true },
  );

  // ---------------------------------------------------------------------------
  // Tool: vi_tokens_get
  // ---------------------------------------------------------------------------

  api.registerTool(
    {
      name: "vi_tokens_get",
      label: "VI: Get Design Tokens",
      description:
        "获取品牌设计 Token（颜色、字体、阴影、边框、间距、动画、栅格）。" +
        "可指定类别获取单个 Token 集合，或不传参数获取所有类别的概览。",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Token 类别（colors/typography/shadows/borders/spacing/animation/grid），留空返回全部",
            enum: ["colors", "typography", "shadows", "borders", "spacing", "animation", "grid"],
          },
        },
      },
      async execute(_toolCallId, params) {
        try {
          const tokens = await import("../tokens/index.js");
          const categories = ["colors", "typography", "shadows", "borders", "spacing", "animation", "grid"];

          if (params.category) {
            if (!categories.includes(params.category)) {
              return textResult(`无效的类别: ${params.category}\n可用类别: ${categories.join(", ")}`);
            }
            return jsonResult({ [params.category]: tokens[params.category] });
          }

          const overview = {};
          for (const cat of categories) {
            const data = tokens[cat];
            overview[cat] = typeof data === "object" ? Object.keys(data) : data;
          }
          return jsonResult(overview);
        } catch (err) {
          return textResult(`获取 Token 失败: ${err.message}`);
        }
      },
    },
    { optional: true },
  );

  // ---------------------------------------------------------------------------
  // Tool: vi_brand_info
  // ---------------------------------------------------------------------------

  api.registerTool(
    {
      name: "vi_brand_info",
      label: "VI: Brand Info",
      description:
        "获取品牌信息文档。包括品牌身份(identity)、哲学(philosophy)、原则(principles)、语调(tone)。" +
        "可指定主题获取单个文档，或不传参数获取所有文档。",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "文档主题（identity/philosophy/principles/tone），留空返回全部",
            enum: ["identity", "philosophy", "principles", "tone"],
          },
        },
      },
      async execute(_toolCallId, params) {
        try {
          const topics = Object.keys(BRAND_FILES);

          if (params.topic) {
            if (!topics.includes(params.topic)) {
              return textResult(`无效的主题: ${params.topic}\n可用主题: ${topics.join(", ")}`);
            }
            const filePath = BRAND_FILES[params.topic];
            if (!nodeFs.existsSync(filePath)) {
              return textResult(`文件不存在: ${params.topic}`);
            }
            const content = nodeFs.readFileSync(filePath, "utf-8");
            return textResult(content);
          }

          const result = {};
          for (const topic of topics) {
            const filePath = BRAND_FILES[topic];
            if (nodeFs.existsSync(filePath)) {
              result[topic] = nodeFs.readFileSync(filePath, "utf-8");
            }
          }
          return jsonResult(result);
        } catch (err) {
          return textResult(`获取品牌信息失败: ${err.message}`);
        }
      },
    },
    { optional: true },
  );

  // ---------------------------------------------------------------------------
  // CLI: openclaw vi {poster|templates|build}
  // ---------------------------------------------------------------------------

  api.registerCli(
    ({ program }) => {
      const vi = program
        .command("vi")
        .description("JS VI System — 品牌视觉识别系统");

      vi.command("templates")
        .description("列出所有可用的海报模板")
        .action(async () => {
          try {
            const { listTemplates } = await import("../core/template-engine.js");
            const templates = listTemplates();

            if (templates.length === 0) {
              console.log("没有找到可用的模板。");
              return;
            }

            console.log("\n  可用模板\n");
            for (const t of templates) {
              console.log(`  ${t.name} — ${t.label}`);
              console.log(`    尺寸:   ${t.sizes.join(", ")}`);
              console.log(`    配色:   ${t.schemes.join(", ")}`);
              console.log(`    字段:`);
              for (const f of t.fields) {
                const req = f.required ? "*" : " ";
                const def = f.default ? ` [${JSON.stringify(f.default)}]` : "";
                console.log(`      ${req} ${f.key} (${f.type})${def}`);
              }
              console.log("");
            }
          } catch (err) {
            console.error(`查询模板失败: ${err.message}`);
          }
        });

      vi.command("poster")
        .description("根据模板生成海报")
        .requiredOption("-t, --template <name>", "模板名称")
        .option("-s, --scheme <scheme>", "配色方案", cfg.defaultScheme)
        .option("--size <size>", "海报尺寸", cfg.defaultSize)
        .option("-f, --format <format>", "输出格式", "html")
        .option("-o, --output <path>", "输出文件路径")
        .option("--title <text>", "标题")
        .option("--subtitle <text>", "副标题")
        .option("--date <text>", "日期")
        .option("--location <text>", "地点")
        .option("--info <text>", "附加信息")
        .option("--tag <text>", "标签")
        .option("--config <path>", "批量生成配置文件（JSON）")
        .option("--fps <number>", "GIF 帧率", parseFloat)
        .option("--duration <number>", "GIF 动画时长（毫秒）", parseFloat)
        .option("--quality <number>", "JPEG 质量（0-100）", parseFloat)
        .option("--browser-path <path>", "Chrome/Edge 可执行文件路径")
        .action(async (opts) => {
          try {
            const { renderToHTML, findTemplate, listTemplates } = await import("../core/template-engine.js");
            const { validateOptions, mergeContentWithDefaults, SIZES } = await import("../core/config.js");
            const { renderOutput } = await import("../core/renderer-factory.js");

            if (opts.config) {
              const raw = nodeFs.readFileSync(nodePath.resolve(opts.config), "utf-8");
              const config = JSON.parse(raw);
              const posters = config.posters || [config];

              for (const entry of posters) {
                const meta = findTemplate(entry.template);
                if (!meta) {
                  console.error(`模板不存在: ${entry.template}`);
                  continue;
                }
                const content = mergeContentWithDefaults(entry.content || {}, meta);
                const dim = SIZES[entry.size || cfg.defaultSize] || SIZES.a4;
                const animMeta = meta.animation || {};
                const outputs = entry.outputs || [{ format: "html", path: nodePath.join(cfg.outputDir, `poster-${entry.template}.html`) }];

                for (const out of outputs) {
                  try {
                    const animated = out.format === "gif";
                    const options = { scheme: entry.scheme || cfg.defaultScheme, size: entry.size || cfg.defaultSize, animated };
                    const html = await renderToHTML(entry.template, content, options);
                    const result = await renderOutput(html, out.format, nodePath.resolve(out.path), {
                      ...options, width: dim.w, height: dim.h,
                      fps: out.fps || animMeta.defaultFps,
                      duration: out.duration || animMeta.duration,
                    });
                    console.log(`✓ 已生成: ${result}`);
                  } catch (err) {
                    console.error(`✗ 失败 ${out.path}: ${err.message}`);
                  }
                }
              }
              return;
            }

            validateOptions(opts);

            const meta = findTemplate(opts.template);
            if (!meta) {
              const available = listTemplates().map((t) => t.name).join(", ");
              console.error(`模板不存在: ${opts.template}`);
              console.error(`可用模板: ${available}`);
              return;
            }

            const content = mergeContentWithDefaults({
              title: opts.title, subtitle: opts.subtitle, date: opts.date,
              location: opts.location, info: opts.info, tag: opts.tag,
            }, meta);

            const animated = opts.format === "gif";
            const options = { scheme: opts.scheme, size: opts.size, animated };
            const html = await renderToHTML(opts.template, content, options);

            const ext = opts.format === "jpg" ? "jpeg" : opts.format;
            const outputPath = opts.output || nodePath.join(cfg.outputDir, `poster-${opts.template}.${ext}`);
            const dim = SIZES[opts.size] || SIZES.a4;
            const animMeta = meta.animation || {};

            const result = await renderOutput(html, opts.format, nodePath.resolve(outputPath), {
              ...options, width: dim.w, height: dim.h,
              fps: opts.fps || animMeta.defaultFps,
              duration: opts.duration || animMeta.duration,
              quality: opts.quality,
              browserPath: opts.browserPath || cfg.browserPath || undefined,
            });
            console.log(`✓ 已生成: ${result}`);
          } catch (err) {
            console.error(`生成海报失败: ${err.message}`);
          }
        });

      vi.command("build")
        .description("从设计 Token 生成 CSS 变量和 Tailwind 预设")
        .action(async () => {
          try {
            const buildScript = nodePath.join(PROJECT_ROOT, "build", "generate.js");
            await import("file:///" + buildScript.replace(/\\/g, "/"));
          } catch (err) {
            console.error(`构建失败: ${err.message}`);
          }
        });
    },
    { commands: ["vi"] },
  );

  // ---------------------------------------------------------------------------
  // HTTP Routes: Brand preview + static assets
  // ---------------------------------------------------------------------------

  api.registerHttpRoute({
    path: `${ROUTE_PREFIX}`,
    auth: "plugin",
    async handler(req, res) {
      res.writeHead(301, { Location: `${ROUTE_PREFIX}/` });
      res.end();
    },
  });

  api.registerHttpRoute({
    path: `${ROUTE_PREFIX}/`,
    auth: "plugin",
    async handler(req, res) {
      serveStaticFile(res, nodePath.join(PREVIEW_DIR, "index.html"));
    },
  });

  api.registerHttpRoute({
    path: `${ROUTE_PREFIX}/posters`,
    auth: "plugin",
    async handler(req, res) {
      serveStaticFile(res, nodePath.join(PREVIEW_DIR, "posters.html"));
    },
  });

  const ALLOWED_STATIC_DIRS = ["preview", "assets", "css"];

  api.registerHttpRoute({
    path: `${ROUTE_PREFIX}/{filePath}`,
    auth: "plugin",
    async handler(req, res) {
      const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const subPath = decodeURIComponent(
        parsed.pathname.slice(ROUTE_PREFIX.length + 1),
      );

      const firstSegment = subPath.split("/")[0];
      if (!ALLOWED_STATIC_DIRS.includes(firstSegment)) {
        const directFile = nodePath.normalize(nodePath.join(PREVIEW_DIR, subPath));
        if (directFile.startsWith(PREVIEW_DIR) && nodeFs.existsSync(directFile)) {
          serveStaticFile(res, directFile);
          return;
        }
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }

      const filePath = nodePath.normalize(nodePath.join(PROJECT_ROOT, subPath));
      if (!filePath.startsWith(PROJECT_ROOT)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }
      if (!nodeFs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      serveStaticFile(res, filePath);
    },
  });
}
