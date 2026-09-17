package com.fastgo.jwt;

import com.fastgo.entity.Usuario;
import com.fastgo.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = authorization.substring(7).trim();

            try {
                if (jwtService.validarToken(token)) {
                    String correo = jwtService.extraerCorreo(token);
                    String rolToken = jwtService.extraerRol(token);
                    java.util.List<Usuario> cuentas = usuarioRepository.findAllByCorreo(correo);
                    Usuario usuario = null;
                    if (rolToken != null && !rolToken.isBlank()) {
                        for (Usuario u : cuentas) {
                            if (u.getRol() != null && rolToken.equalsIgnoreCase(u.getRol().getNombre())) {
                                usuario = u;
                                break;
                            }
                        }
                    }
                    if (usuario == null && !cuentas.isEmpty()) {
                        usuario = cuentas.get(0);
                    }

                    if (usuario != null
                            && Boolean.TRUE.equals(usuario.getEstado())
                            && usuario.getRol() != null
                            && usuario.getRol().getNombre() != null) {

                        String rolActual = usuario.getRol().getNombre().trim().toUpperCase();
                        SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(
                                        usuario.getCorreo(),
                                        null,
                                        AuthorityUtils.createAuthorityList("ROLE_" + rolActual)));
                    }
                }
            } catch (RuntimeException ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
