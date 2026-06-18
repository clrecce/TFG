-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-06-2026 a las 02:41:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ecodev_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas`
--

CREATE TABLE `alertas` (
  `id` int(11) NOT NULL,
  `severidad` varchar(50) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `recomendacion` text DEFAULT NULL,
  `resuelta` tinyint(1) DEFAULT 0,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `nombre_completo` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `motor_ia` varchar(50) DEFAULT NULL,
  `umbral_co2` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `nombre_completo`, `email`, `motor_ia`, `umbral_co2`) VALUES
(1, 'Administrador', 'administrador@ecodev.com.ar', 'gemma:2b', 0.05);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `despliegues`
--

CREATE TABLE `despliegues` (
  `id` int(11) NOT NULL,
  `entorno` varchar(50) DEFAULT NULL,
  `fecha_despliegue` date DEFAULT NULL,
  `metricas_eco` text DEFAULT NULL,
  `proyecto_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `despliegues`
--

INSERT INTO `despliegues` (`id`, `entorno`, `fecha_despliegue`, `metricas_eco`, `proyecto_id`) VALUES
(14, 'AWS EC2/S3 (Simulado)', '2026-06-09', 'Código Eco-Verificado - Sostenibilidad Óptima', 20);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `optimizaciones`
--

CREATE TABLE `optimizaciones` (
  `id` int(11) NOT NULL,
  `codigo_original` text NOT NULL,
  `codigo_optimizado` text NOT NULL,
  `emisiones_co2_kg` float DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `optimizaciones`
--

INSERT INTO `optimizaciones` (`id`, `codigo_original`, `codigo_optimizado`, `emisiones_co2_kg`, `fecha`) VALUES
(129, 'UI:\n<style>\n* { box-sizing: border-box; } body {margin: 0;}\n</style>\n<body id=\"ibxt\"><form action=\"save_patient.php\" method=\"post\"><label for=\"nombre\">Nombre:</label><input type=\"text\" id=\"nombre\" name=\"nombre\"/><label for=\"apellido\">Apellido:</label><input type=\"text\" id=\"apellido\" name=\"apellido\"/><input type=\"submit\" value=\"Guardar\" id=\"i48cc\"/></form></body>\nLogica:\n', '<head>\n  <style>\n    * { box-sizing: border-box; } body {margin: 0;}\n  </style>\n</head>\n<body id=\"ibxt\">\n\n<form action=\"save_patient.php\" method=\"post\">\n  <label for=\"nombre\">Nombre:</label><input type=\"text\" id=\"nombre\" name=\"nombre\" required><br>\n  <label for=\"apellido\">Apellido:</label><input type=\"text\" id=\"apellido\" name=\"apellido\" required><br>\n  <input type=\"submit\" value=\"Guardar\" id=\"i48cc\">\n</form>\n\n</body>\n</html>', 0.0000435044, '2026-06-09 03:00:00'),
(130, 'UI:\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#in93{padding:10px;width:80%;margin-bottom:10px;}#iy7f{padding:10px 20px;background:#4ade80;border:none;border-radius:5px;}#izzj{padding:20px;background:#f4f4f5;border-radius:8px;margin:5px;}#i42n{padding:10px 20px;background:#4ade80;border:none;border-radius:5px;color:#1e1e2f;font-weight:bold;cursor:pointer;margin:5px;}\n</style>\n<body id=\"ibxt\"><form id=\"izzj\"><input type=\"text\" placeholder=\"Ingresa datos...\" id=\"in93\"/><br/><button id=\"iy7f\">Enviar</button></form><button id=\"i42n\">Botón Eco</button></body>\nLogica:\n', '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    * { box-sizing: border-box; } body {margin: 0;}#in93{padding:10px;width:80%;margin-bottom:10px;}#iy7f{padding:10px 20px;background:#4ade80;border:none;border-radius:5px;}#izzj{padding:20px;background:#f4f4f5;border-radius:8px;margin:5px;}#i42n{padding:10px 20px;background:#4ade80;border:none;border-radius:5px;color:#1e1e2f;font-weight:bold;cursor:pointer;margin:5px;}\n  </style>\n</head>\n<body id=\"ibxt\">\n<form id=\"izzj\">\n  <input type=\"text\" placeholder=\"Ingresa datos...\" id=\"in93\"/>\n  <button id=\"iy7f\">Enviar</button>\n</form>\n<button id=\"i42n\">Botón Eco</button>\n<script>\n// Variables y funciones\nconst input = document.getElementById(\'in93\');\nconst sendButton = document.getElementById(\'iy7f\');\nconst output = document.getElementById(\'izzj\');\nconst ecoButton = document.getElementById(\'i42n\');\n\n// Escuchar al botón de enviar\nsendButton.addEventListener(\'click\', () => {\n  // Convertir la entrada en una cadena\n  const data = input.value;\n\n  // Enviar el datos mediante Ajax\n  fetch(\'/procesar.php\', {\n    method: \'POST\',\n    headers: { \'Content-Type\': \'application/x-www-form-urlencoded\' },\n    body: new FormData(data),\n  })\n    .then(response => response.json())\n    .then(data => {\n      // Mostrar el resultado\n      output.innerHTML = `Resultados: ${data.resultado}`;\n    })\n    .catch(error => {\n      // Mostrar el error\n      output.innerHTML = `Error: ${error.message}`;\n    });\n});\n</script>\n</body>\n</html>', 0.0000659917, '2026-06-09 03:00:00'),
(131, 'UI:\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#ivwo{padding:10px 20px;background:#4ade80;border:none;border-radius:5px;color:#1e1e2f;font-weight:bold;cursor:pointer;margin:5px;}\n</style>\n<body id=\"ibxt\"><button id=\"ivwo\">Botón Eco</button></body>\nLogica:\n', 'const ivwo = document.getElementById(\'ivwo\');\n\nivwo.addEventListener(\'click\', function() {\n  // Código del botón eco\n});\n</script>\n\n<style>\n* { box-sizing: border-box; } body {margin: 0;}#ivwo{padding:10px 20px;background:#4ade80;border:none;border-radius:5px;color:#1e1e2f;font-weight:bold;cursor:pointer;margin:5px;}\n</style>', 0.0000358314, '2026-06-09 03:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyectos`
--

INSERT INTO `proyectos` (`id`, `nombre`, `fecha_inicio`, `estado`, `usuario_id`) VALUES
(20, 'Proyecto A', '2026-06-09', 'Desplegado', 1),
(23, 'Proyecto B', '2026-06-09', 'En Desarrollo', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pruebas`
--

CREATE TABLE `pruebas` (
  `id` int(11) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `resultado` tinyint(1) DEFAULT NULL,
  `eficiencia_energetica` float DEFAULT NULL,
  `proyecto_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pruebas`
--

INSERT INTO `pruebas` (`id`, `tipo`, `resultado`, `eficiencia_energetica`, `proyecto_id`) VALUES
(108, 'Ejecución Real (Prueba Funcional)', 1, 0.00000344596, 20);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `estimacion_co2` float DEFAULT NULL,
  `comparacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id`, `fecha`, `estimacion_co2`, `comparacion`) VALUES
(9, '2026-06-09', 25.9075, 'Reporte emitido comprobando ahorro del 100.0% vs método tradicional.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requisitos`
--

CREATE TABLE `requisitos` (
  `id` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `prioridad` varchar(50) DEFAULT NULL,
  `kwh_estimado` float DEFAULT NULL,
  `proyecto_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `requisitos`
--

INSERT INTO `requisitos` (`id`, `descripcion`, `prioridad`, `kwh_estimado`, `proyecto_id`) VALUES
(26, 'Un campo de texto para interactuar con la inteligencia artificial.', 'Alta', 39.75, 20),
(27, 'Una pantalla para mostrar un video.', 'Media', 16.5, 20),
(28, 'Formulario para guardar en base de datos el nombre y apellido de un paciente.', 'Baja', 4, 20),
(33, 'Un campo de texto para guardar datos con un botón llamado \"enviar\".', 'Baja', 22.8, 23);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`) VALUES
(1, 'Administrador', 'administrador@ecodev.com.ar', '$2b$12$oqr0.rUoVsdtRtbQxOR3Le6mPuwnOwIeo3XCjIGkKIl//Jo86vxCe', 'Administrador'),
(2, 'Gerente', 'gerente@ecodev.com.ar', '$2b$12$5mAjTyQ3/JbwXv9f6HzM8eUr7axciBIzB1o4/nhlz/EjrnU/InT6u', 'Gerente de Proyecto'),
(3, 'Arquitecto', 'arquitecto@ecodev.com.ar', '$2b$12$59FYv5YwocpA9g0kd7XkruRtRu0l//rEEmigGz96GArBaRspR0F/i', 'Arquitecto de Software'),
(4, 'Ingeniero', 'ingeniero@ecodev.com.ar', '$2b$12$U/J0tOy/aiKhMMlxFD0jEupWHEpA3PkGwmzka2EmyS2jT95888JCS', 'Ingeniero de Operaciones'),
(5, 'Desarrollador', 'desarrollador@ecodev.com.ar', '$2b$12$199bwgJOtSFKAo0IPeloluLQRdSAof2N1upnCnSahnMaafCzo49B6', 'Desarrollador');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `despliegues`
--
ALTER TABLE `despliegues`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `optimizaciones`
--
ALTER TABLE `optimizaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pruebas`
--
ALTER TABLE `pruebas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `requisitos`
--
ALTER TABLE `requisitos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alertas`
--
ALTER TABLE `alertas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `despliegues`
--
ALTER TABLE `despliegues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `optimizaciones`
--
ALTER TABLE `optimizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `pruebas`
--
ALTER TABLE `pruebas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `requisitos`
--
ALTER TABLE `requisitos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
