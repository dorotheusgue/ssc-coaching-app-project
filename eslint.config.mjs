import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", "design_handoff_paper_carbon_themes/**"],
  },
];

export default eslintConfig;
