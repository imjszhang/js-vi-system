// Auto-generated from tokens/*.json — do not edit manually
// Run `npm run build` to regenerate

export default {
  "theme": {
    "extend": {
      "fontFamily": {
        "sans": [
          "Space Grotesk",
          "sans-serif"
        ],
        "mono": [
          "JetBrains Mono",
          "monospace"
        ]
      },
      "colors": {
        "brand": {
          "yellow": "#FCD228",
          "black": "#000000",
          "white": "#FFFFFF"
        }
      },
      "boxShadow": {
        "brutal": "4px 4px 0px 0px #000000",
        "brutal-lg": "8px 8px 0px 0px #000000",
        "brutal-hover": "2px 2px 0px 0px #000000",
        "brutal-white": "4px 4px 0px 0px #FFFFFF"
      },
      "borderWidth": {
        "3": "3px"
      },
      "animation": {
        "marquee": "marquee 25s linear infinite",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin": "spin 0.8s linear infinite"
      },
      "keyframes": {
        "marquee": {
          "from": {
            "transform": "translateX(0%)"
          },
          "to": {
            "transform": "translateX(-100%)"
          }
        },
        "slideUp": {
          "from": {
            "opacity": "0",
            "transform": "translateY(20px)"
          },
          "to": {
            "opacity": "1",
            "transform": "translateY(0)"
          }
        },
        "spin": {
          "to": {
            "transform": "rotate(360deg)"
          }
        },
        "pulse": {
          "0%, 100%": {
            "opacity": "1"
          },
          "50%": {
            "opacity": "0.5"
          }
        }
      }
    }
  }
};
