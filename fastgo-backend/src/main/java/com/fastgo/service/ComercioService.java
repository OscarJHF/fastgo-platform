package com.fastgo.service;

import com.fastgo.dto.ComercioRequestDTO;
import com.fastgo.dto.ComercioResponseDTO;
import com.fastgo.entity.CategoriaComercio;
import com.fastgo.entity.Comercio;
import com.fastgo.entity.Usuario;
import com.fastgo.repository.CategoriaComercioRepository;
import com.fastgo.repository.ComercioRepository;
import com.fastgo.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ComercioService {
    private final ComercioRepository comercioRepository; private final UsuarioRepository usuarioRepository; private final CategoriaComercioRepository categoriaRepository;
    public ComercioService(ComercioRepository c,UsuarioRepository u,CategoriaComercioRepository cat){comercioRepository=c;usuarioRepository=u;categoriaRepository=cat;}
    public List<ComercioResponseDTO> listarComercios(){return comercioRepository.findAll().stream().map(this::dto).toList();}
    public ComercioResponseDTO buscarPorId(Integer id){return dto(comercioRepository.findById(id).orElseThrow(()->new RuntimeException("Comercio no encontrado")));}
    public ComercioResponseDTO guardar(ComercioRequestDTO d){
        if (d == null) throw new IllegalArgumentException("Los datos del comercio son obligatorios");
        Usuario u=usuario(); exigirComercio(u);
        if(comercioRepository.findByUsuarioId(u.getId()).isPresent())throw new RuntimeException("El usuario ya tiene un comercio registrado");
        Comercio c=new Comercio(); c.setUsuario(u); copiar(d,c); return dto(comercioRepository.save(c));
    }
    public ComercioResponseDTO actualizar(Integer id,ComercioRequestDTO d){
        if (d == null) throw new IllegalArgumentException("Los datos del comercio son obligatorios");
        Usuario u=usuario(); Comercio c=propio(id,u); copiar(d,c); return dto(comercioRepository.save(c));
    }
    public void eliminar(Integer id){Usuario u=usuario(); comercioRepository.delete(propio(id,u));}
    public Comercio obtenerEntidadPropia(Integer id){return propio(id,usuario());}
    private void copiar(ComercioRequestDTO d,Comercio c){
        if(d.getNombre()==null||d.getNombre().isBlank())throw new RuntimeException("El nombre del comercio es obligatorio");
        if(d.getCategoriaId()==null)throw new RuntimeException("La categoría es obligatoria");
        CategoriaComercio cat=categoriaRepository.findById(d.getCategoriaId()).orElseThrow(()->new RuntimeException("Categoría de comercio no encontrada"));
        c.setCategoria(cat);c.setNombre(d.getNombre());c.setDescripcion(d.getDescripcion());c.setTelefono(d.getTelefono());c.setCorreo(d.getCorreo());c.setLogo(d.getLogo());c.setBanner(d.getBanner());c.setNit(d.getNit());if(d.getActivo()!=null)c.setActivo(d.getActivo());
    }
    private Comercio propio(Integer id,Usuario u){return comercioRepository.findByIdAndUsuarioId(id,u.getId()).orElseThrow(()->new RuntimeException("Comercio no encontrado o no pertenece al usuario"));}
    private void exigirComercio(Usuario u){if(u.getRol()==null||!"COMERCIO".equalsIgnoreCase(u.getRol().getNombre()))throw new RuntimeException("Solo los usuarios con rol COMERCIO pueden administrar un comercio");}
    private Usuario usuario(){Authentication a=SecurityContextHolder.getContext().getAuthentication();if(a==null||!a.isAuthenticated())throw new RuntimeException("Usuario no autenticado");return usuarioRepository.findByCorreo(a.getName()).orElseThrow(()->new RuntimeException("Usuario autenticado no encontrado"));}
    private ComercioResponseDTO dto(Comercio c){return new ComercioResponseDTO(c.getId(),c.getNombre(),c.getDescripcion(),c.getTelefono(),c.getCorreo(),c.getLogo(),c.getBanner(),c.getNit(),c.getActivo(),c.getCategoria()!=null?c.getCategoria().getNombre():null);}
}
