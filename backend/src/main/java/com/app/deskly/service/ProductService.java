package com.app.deskly.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.app.deskly.dto.ProductCreateDTO;
import com.app.deskly.model.*;
import com.app.deskly.repository.ProductRepository;
import org.apache.commons.io.FilenameUtils;


@Service
public class ProductService {

    @Autowired

    private ProductRepository productRepository;

    public Page<Product> listProducts(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search == null || search.isEmpty()) {
            return productRepository.findAll(pageable);
        } else {
            return productRepository.findByName(search, pageable);
        }
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Product update(Long id, Product updatedProduct) {
        Product existing = getById(id);
        existing.setName(updatedProduct.getName());
        existing.setQuantity(updatedProduct.getQuantity());
        existing.setPrice(updatedProduct.getPrice());
        return productRepository.save(existing);
    }

    public void enableDisable(Long id, boolean active) {
        Product product = getById(id);
        product.setActive(active);
        productRepository.save(product);
    }

    

    public void createProduct(ProductCreateDTO dto, List<MultipartFile> images) {

        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setRating(dto.getRating());
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity());
        product.setActive(true);

        List<ProductImage> imageList = new ArrayList<>();
        
        for (int i = 0; i < images.size(); i++) {

            MultipartFile file = images.get(i);
            String extension = FilenameUtils.getExtension(file.getOriginalFilename());
            String newFileName = UUID.randomUUID().toString() + "." + extension;

            
            String uploadDir = "/deskly-ecommerce-2/assets/images/";
            Path filePath = Paths.get(uploadDir, newFileName);
            try {
                Files.write(filePath, file.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Erro ao salvar imagem", e);
            }

            ProductImage image = new ProductImage();
            image.setFileName(newFileName);
            image.setFilePath(filePath.toString());
            image.setIsMain(dto.getMainImageIndex() != null && dto.getMainImageIndex() == i);
            image.setProduct(product);

            imageList.add(image);
    }

    product.setImages(imageList);
    productRepository.save(product); 
}

}
