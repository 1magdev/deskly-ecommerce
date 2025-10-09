package com.app.deskly.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.app.deskly.dto.ProductCreateDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.Stock;
import com.app.deskly.repository.ProductRepository;
import com.app.deskly.repository.StockRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    public Page<Product> listProducts(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search == null || search.isEmpty()) {
            return productRepository.findAll(pageable);
        } else {
            return productRepository.findByNameContainingIgnoreCase(search, pageable);
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
        existing.setPrice(updatedProduct.getPrice());

        // Atualiza a imagem se fornecida
        if (updatedProduct.getProductImage() != null) {
            existing.setProductImage(updatedProduct.getProductImage());
        }

        return productRepository.save(existing);
    }

    public Product updateWithImage(Long id, Product updatedProduct, MultipartFile image) {
        Product existing = getById(id);
        existing.setName(updatedProduct.getName());
        existing.setPrice(updatedProduct.getPrice());

        // Processa nova imagem se fornecida
        if (image != null && !image.isEmpty()) {
            String extension = FilenameUtils.getExtension(image.getOriginalFilename());
            String newFileName = UUID.randomUUID().toString() + "." + extension;

            String uploadDir = "/deskly-ecommerce-2/assets/images/";
            Path filePath = Paths.get(uploadDir, newFileName);
            try {
                Files.write(filePath, image.getBytes());
                existing.setProductImage(newFileName);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao salvar imagem", e);
            }
        }

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
        product.setActive(true);

        String mainImagePath = null;
        int mainImageIndex = dto.getMainImageIndex() != null ? dto.getMainImageIndex() : 0;

        for (int i = 0; i < images.size(); i++) {

            MultipartFile file = images.get(i);
            String extension = FilenameUtils.getExtension(file.getOriginalFilename());
            String newFileName = UUID.randomUUID().toString() + "." + extension;

            String uploadDir = "/deskly-ecommerce-2/assets/images/";
            Path filePath = Paths.get(uploadDir, newFileName);
            try {
                Files.write(filePath, file.getBytes());

                // Define a imagem principal baseada no índice
                if (i == mainImageIndex) {
                    mainImagePath = newFileName;
                }
            } catch (IOException e) {
                throw new RuntimeException("Erro ao salvar imagem", e);
            }

        }

        // Define a imagem principal no produto
        product.setProductImage(mainImagePath);

        // Salva o produto
        Product savedProduct = productRepository.save(product);

        // Cria registro no estoque se quantidade foi informada
        if (dto.getQuantity() != null && dto.getQuantity() > 0) {
            Stock stock = new Stock();
            stock.setProduct(savedProduct);
            stock.setQuantity(dto.getQuantity());
            stockRepository.save(stock);
        }
    }

}
