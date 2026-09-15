package com.fastgo.service;
import com.fastgo.entity.Carrito; import com.fastgo.entity.Usuario; import com.fastgo.repository.CarritoRepository; import com.fastgo.repository.UsuarioRepository; import com.fastgo.repository.SucursalRepository; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
@Service public class CarritoService { private final CarritoRepository repo; private final UsuarioRepository usuarioRepo; private final SucursalRepository sucRepo; public CarritoService(CarritoRepository r,UsuarioRepository u,SucursalRepository s){repo=r;usuarioRepo=u;sucRepo=s;}
public Carrito obtenerCarrito(Integer sucursalId){
    Usuario u=usuario();
    if(sucursalId==null || sucursalId<=0) throw new IllegalArgumentException("Sucursal no válida");
    if(!sucRepo.existsById(sucursalId)) throw new RuntimeException("Sucursal no encontrada");
    return repo.findByUsuarioIdAndSucursalId(u.getId(),sucursalId).orElseGet(()->crearSeguramente(u.getId(),sucursalId));
}
private Carrito crearSeguramente(Integer uid,Integer sid){
    Carrito c=new Carrito();
    c.setUsuarioId(uid);
    c.setSucursalId(sid);
    try {
        return repo.saveAndFlush(c);
    } catch (DataIntegrityViolationException ex) {
        return repo.findByUsuarioIdAndSucursalId(uid,sid)
                .orElseThrow(() -> ex);
    }
}
public Carrito obtenerPropio(Integer id){Carrito c=repo.findById(id).orElseThrow(()->new RuntimeException("Carrito no encontrado"));if(!c.getUsuarioId().equals(usuario().getId()))throw new RuntimeException("No tienes permiso para acceder a este carrito");return c;}
public void validarPropietario(Integer id){obtenerPropio(id);} public Integer usuarioActualId(){return usuario().getId();}
private Usuario usuario(){var a=SecurityContextHolder.getContext().getAuthentication();if(a==null||!a.isAuthenticated())throw new RuntimeException("Usuario no autenticado");return usuarioRepo.findByCorreo(a.getName()).orElseThrow(()->new RuntimeException("Usuario autenticado no encontrado"));}}
