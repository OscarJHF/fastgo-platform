package com.fastgo.repository;
import com.fastgo.entity.CategoriaComercio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CategoriaComercioRepository extends JpaRepository<CategoriaComercio,Integer>{List<CategoriaComercio> findByActivoTrue();}
