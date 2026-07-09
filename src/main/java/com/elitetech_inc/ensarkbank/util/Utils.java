package com.elitetech_inc.ensarkbank.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Random;
import java.util.UUID;

@Service
public class Utils {

    @Value("${image.upload.dir}")
    private String uploadDir;

    public String generateReference() {
        String uuid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return uuid.substring(0, 12);
    }

    public String generateRouteNumber(){
        final String fixedRoute = "6830";
        String randomPart = String.format("%05d",
                new Random().nextInt(100000));
        String accNumber =fixedRoute + randomPart;
        return accNumber;
    }


    /**
     * @param file      — uploaded MultipartFile
     * @param subFolder — "customer","kyc", "employee"
     * @param prefix    —  name, docType
     * @return stored filename
     */
    public String uploadFile(MultipartFile file, String subFolder, String prefix) {
        try {
            Path dir = Paths.get(uploadDir, subFolder);
            if (!Files.exists(dir)) Files.createDirectories(dir);

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }

            String fileName = prefix.trim().replaceAll("\\s+", "_")
                    + "_" + UUID.randomUUID() + ext;

            Files.copy(file.getInputStream(), dir.resolve(fileName));
            return fileName;

        } catch (Exception e) {
            throw new RuntimeException("File upload failed [" + prefix + "]: " + e.getMessage());
        }
    }

    public void deleteFile(String subFolder, String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, subFolder, fileName);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

        } catch (Exception e) {
            throw new RuntimeException("File delete failed [" + fileName + "]: " + e.getMessage());
        }
    }
}
