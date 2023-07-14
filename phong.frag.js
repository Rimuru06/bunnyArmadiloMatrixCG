export default
`#version 300 es
precision highp float;

uniform vec4 light_pos;

uniform vec4 light_amb_c;
uniform float light_amb_k;

uniform vec4 light_dif_c;
uniform float light_dif_k;

uniform vec4 light_esp_c;
uniform float light_esp_k;
uniform float light_esp_p;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

in vec4 fPosition;
in vec4 fColor;
in vec4 fNormal;

out vec4 minhaColor;

void main()
{
  mat4 modelView = u_view * u_model;

  vec4 viewPosition = modelView * fPosition;

  vec4 viewNormal = transpose(inverse(modelView)) * fNormal;
  viewNormal = normalize(viewNormal);

  vec4 viewLightPos = u_view * light_pos * normalize(viewPosition);

  vec4 lightDir = normalize(viewLightPos - viewPosition);

  vec4 cameraDir = normalize(-viewPosition);

  float fatorDif = max(0.0, dot(lightDir, viewNormal));

  vec4 halfVec = normalize(lightDir + cameraDir);
  float fatorEsp = pow(max(0.0, dot(halfVec, viewNormal)), light_esp_p);

  minhaColor = 0.45 * fColor + 0.55 * (light_amb_k * light_amb_c + fatorDif * light_dif_k * light_dif_c + fatorEsp * light_esp_k * light_esp_c);
}`